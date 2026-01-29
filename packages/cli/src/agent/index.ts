import { createServer, Server, Socket } from "node:net";
import { existsSync, unlinkSync } from "node:fs";
import { randomUUID } from "node:crypto";
import {
  parsemessage,
  SSH_AGENTC_REQUEST_IDENTITIES,
  SSH_AGENTC_SIGN_REQUEST,
  SSH_AGENTC_ADD_IDENTITY,
  SSH_AGENTC_REMOVE_IDENTITY,
  SSH_AGENTC_REMOVE_ALL_IDENTITIES,
  buildidentities,
  buildsignature,
  buildfailure,
  buildsuccess,
  readstring,
  readuint32,
  detectkeytype,
} from "./protocol.js";
import {
  socketpath,
  listkeys,
  getkeybyblob,
  signdata,
  addkey,
  removekeybyblob,
  removeallkeys,
  requestapproval,
  logusage,
} from "./keys.js";

interface AgentOptions {
  onapprovalrequest?: (keyid: string, sessionid: string) => Promise<boolean>;
}

let server: Server | null = null;
let options: AgentOptions = {};

function handleclient(socket: Socket) {
  const sessionid = randomUUID();
  let buffer = Buffer.alloc(0);

  socket.on("data", async (data) => {
    buffer = Buffer.concat([buffer, data]);
    while (buffer.length >= 4) {
      const msglen = readuint32(buffer, 0);
      if (buffer.length < 4 + msglen) break;
      const message = parsemessage(buffer);
      if (!message) {
        buffer = buffer.subarray(4 + msglen);
        continue;
      }
      const response = await handlemessage(message.type, message.payload, sessionid);
      socket.write(response);
      buffer = buffer.subarray(4 + msglen);
    }
  });

  socket.on("error", () => {});
  socket.on("close", () => {});
}

async function handlemessage(type: number, payload: Buffer, sessionid: string): Promise<Buffer> {
  switch (type) {
    case SSH_AGENTC_REQUEST_IDENTITIES:
      return handleidentities();
    case SSH_AGENTC_SIGN_REQUEST:
      return handlesign(payload, sessionid);
    case SSH_AGENTC_ADD_IDENTITY:
      return handleadd(payload);
    case SSH_AGENTC_REMOVE_IDENTITY:
      return handleremove(payload);
    case SSH_AGENTC_REMOVE_ALL_IDENTITIES:
      return handleremoveall();
    default:
      return buildfailure();
  }
}

function handleidentities(): Buffer {
  const keys = listkeys();
  return buildidentities(keys);
}

async function handlesign(payload: Buffer, sessionid: string): Promise<Buffer> {
  let offset = 0;
  const { value: blob, length: bloblen } = readstring(payload, offset);
  offset += bloblen;
  const { value: data, length: datalen } = readstring(payload, offset);
  offset += datalen;
  const flags = payload.length > offset ? readuint32(payload, offset) : 0;
  const key = getkeybyblob(blob);
  if (!key) {
    logusage("unknown", "sign_failed", { reason: "key_not_found" });
    return buildfailure();
  }
  if (key.requireapproval) {
    if (!requestapproval(key.id, sessionid)) {
      if (options.onapprovalrequest) {
        const approved = await options.onapprovalrequest(key.id, sessionid);
        if (!approved) {
          logusage(key.id, "sign_denied", { sessionid });
          return buildfailure();
        }
      } else {
        logusage(key.id, "sign_denied", { reason: "approval_required", sessionid });
        return buildfailure();
      }
    }
  }
  const signature = signdata(key, data, flags);
  if (signature.length === 0) {
    logusage(key.id, "sign_failed", { reason: "signature_error" });
    return buildfailure();
  }
  return buildsignature(signature);
}

function handleadd(payload: Buffer): Buffer {
  let offset = 0;
  const { value: keytypebuf, length: typelen } = readstring(payload, offset);
  offset += typelen;
  const keytype = keytypebuf.toString();
  if (keytype === "ssh-ed25519") {
    const { value: pubkey, length: publen } = readstring(payload, offset);
    offset += publen;
    const { value: privkey, length: privlen } = readstring(payload, offset);
    offset += privlen;
    const { value: commentbuf } = readstring(payload, offset);
    const comment = commentbuf.toString();
    const seed = privkey.subarray(0, 32);
    const pub = privkey.subarray(32, 64);
    const opensshkey = buildopensshkey("ssh-ed25519", pub, privkey, comment);
    const id = randomUUID();
    if (addkey(id, opensshkey, comment)) {
      return buildsuccess();
    }
    return buildfailure();
  }
  if (keytype === "ssh-rsa") {
    const { value: n, length: nlen } = readstring(payload, offset);
    offset += nlen;
    const { value: e, length: elen } = readstring(payload, offset);
    offset += elen;
    const { value: d, length: dlen } = readstring(payload, offset);
    offset += dlen;
    const { value: iqmp, length: iqmplen } = readstring(payload, offset);
    offset += iqmplen;
    const { value: p, length: plen } = readstring(payload, offset);
    offset += plen;
    const { value: q, length: qlen } = readstring(payload, offset);
    offset += qlen;
    const { value: commentbuf } = readstring(payload, offset);
    const comment = commentbuf.toString();
    return buildfailure();
  }
  if (keytype.startsWith("ecdsa-sha2-")) {
    return buildfailure();
  }
  return buildfailure();
}

function handleremove(payload: Buffer): Buffer {
  const { value: blob } = readstring(payload, 0);
  if (removekeybyblob(blob)) {
    return buildsuccess();
  }
  return buildfailure();
}

function handleremoveall(): Buffer {
  removeallkeys();
  return buildsuccess();
}

function buildopensshkey(keytype: string, pubkey: Buffer, privkey: Buffer, comment: string): string {
  const checkint = Math.floor(Math.random() * 0xffffffff);
  const checkbuf = Buffer.alloc(4);
  checkbuf.writeUInt32BE(checkint, 0);
  const keytypebuf = Buffer.from(keytype);
  const commentbuf = Buffer.from(comment);
  const privatepayload = Buffer.concat([
    checkbuf,
    checkbuf,
    writestringsimple(keytypebuf),
    writestringsimple(pubkey),
    writestringsimple(privkey),
    writestringsimple(commentbuf),
  ]);
  const padding = 8 - (privatepayload.length % 8);
  const padded = Buffer.concat([privatepayload, Buffer.from([...Array(padding).keys()].map((i) => i + 1))]);
  const publicblob = Buffer.concat([writestringsimple(keytypebuf), writestringsimple(pubkey)]);
  const header = Buffer.from("openssh-key-v1\0");
  const cipher = Buffer.from("none");
  const kdf = Buffer.from("none");
  const kdfopts = Buffer.alloc(0);
  const numkeys = Buffer.alloc(4);
  numkeys.writeUInt32BE(1, 0);
  const encoded = Buffer.concat([
    header,
    writestringsimple(cipher),
    writestringsimple(kdf),
    writestringsimple(kdfopts),
    numkeys,
    writestringsimple(publicblob),
    writestringsimple(padded),
  ]);
  const base64 = encoded.toString("base64").match(/.{1,70}/g)?.join("\n") || "";
  return `-----BEGIN OPENSSH PRIVATE KEY-----\n${base64}\n-----END OPENSSH PRIVATE KEY-----\n`;
}

function writestringsimple(data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  return Buffer.concat([len, data]);
}

export function start(opts: AgentOptions = {}): Promise<string> {
  options = opts;
  return new Promise((resolve, reject) => {
    const path = socketpath();
    if (process.platform !== "win32" && existsSync(path)) {
      try {
        unlinkSync(path);
      } catch {}
    }
    server = createServer(handleclient);
    server.on("error", (err) => {
      logusage("agent", "start_failed", { error: err.message });
      reject(err);
    });
    server.listen(path, () => {
      logusage("agent", "started", { path });
      resolve(path);
    });
  });
}

export function stop(): Promise<void> {
  return new Promise((resolve) => {
    if (!server) {
      resolve();
      return;
    }
    server.close(() => {
      const path = socketpath();
      if (process.platform !== "win32" && existsSync(path)) {
        try {
          unlinkSync(path);
        } catch {}
      }
      logusage("agent", "stopped");
      server = null;
      resolve();
    });
  });
}

export function isrunning(): boolean {
  return server !== null && server.listening;
}

export function getsocketpath(): string {
  return socketpath();
}

export {
  addkey,
  removekey,
  listkeys,
  listkeysdetailed,
  getkey,
  loadkeyfromfile,
  keyfingerprint,
  grantapproval,
  revokeapproval,
  logusage,
} from "./keys.js";

export { detectkeytype } from "./protocol.js";
