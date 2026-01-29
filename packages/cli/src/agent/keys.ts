import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  detectkeytype,
  parsekeyed25519,
  parsekeyrsa,
  publickeyblob,
  readstring,
  signed25519,
  signrsa,
  signecdsa,
} from "./protocol.js";

export interface LoadedKey {
  id: string;
  keytype: "ed25519" | "rsa" | "ecdsa";
  privatekey: string;
  publickey: Buffer;
  blob: Buffer;
  comment: string;
  seed?: Buffer;
  curve?: string;
  requireapproval: boolean;
  expires?: number;
}

interface KeyStore {
  keys: Map<string, LoadedKey>;
  blobindex: Map<string, string>;
}

const store: KeyStore = {
  keys: new Map(),
  blobindex: new Map(),
};

function datadir(): string {
  if (process.platform === "win32") {
    return join(process.env.APPDATA || homedir(), "noro");
  }
  return join(process.env.XDG_DATA_HOME || join(homedir(), ".local", "share"), "noro");
}

function logdir(): string {
  return join(datadir(), "logs");
}

function ensuredirs() {
  const dirs = [datadir(), logdir()];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
}

export function socketpath(): string {
  if (process.platform === "win32") {
    return "\\\\.\\pipe\\noro-ssh-agent";
  }
  ensuredirs();
  return join(datadir(), "agent.sock");
}

export function logusage(keyid: string, action: string, details: Record<string, unknown> = {}) {
  ensuredirs();
  const logfile = join(logdir(), "agent.log");
  const entry = {
    timestamp: new Date().toISOString(),
    keyid,
    action,
    ...details,
  };
  appendFileSync(logfile, JSON.stringify(entry) + "\n");
}

export function addkey(
  id: string,
  privatekey: string,
  comment: string,
  options: { requireapproval?: boolean; ttl?: number } = {}
): boolean {
  const keytype = detectkeytype(privatekey);
  if (!keytype) return false;

  let publickey: Buffer;
  let seed: Buffer | undefined;
  let curve: string | undefined;

  if (keytype === "ed25519") {
    const parsed = parsekeyed25519(privatekey);
    if (!parsed) return false;
    publickey = parsed.publickey;
    seed = parsed.privatekey;
  } else if (keytype === "rsa") {
    const parsed = parsekeyrsa(privatekey);
    if (!parsed) return false;
    publickey = parsed.publickey;
  } else {
    const lines = privatekey.split("\n").filter((l) => !l.startsWith("-----") && l.trim());
    const decoded = Buffer.from(lines.join(""), "base64");
    const marker = Buffer.from("openssh-key-v1\0");
    let offset = marker.length;
    const { length: cipherlen } = readstring(decoded, offset);
    offset += cipherlen;
    const { length: kdflen } = readstring(decoded, offset);
    offset += kdflen;
    const { length: kdfoptlen } = readstring(decoded, offset);
    offset += kdfoptlen;
    offset += 4;
    const { value: publicblob, length: publen } = readstring(decoded, offset);
    offset += publen;
    const { value: privateblob } = readstring(decoded, offset);
    const { value: curvevalue } = readstring(privateblob, 8 + readstring(privateblob, 8).length);
    publickey = publicblob;
    curve = curvevalue.toString();
  }

  const blob = publickeyblob(keytype, publickey, privatekey);
  const blobhex = blob.toString("hex");

  const loaded: LoadedKey = {
    id,
    keytype,
    privatekey,
    publickey,
    blob,
    comment,
    seed,
    curve,
    requireapproval: options.requireapproval || false,
    expires: options.ttl ? Date.now() + options.ttl : undefined,
  };

  store.keys.set(id, loaded);
  store.blobindex.set(blobhex, id);
  logusage(id, "add", { keytype, comment });
  return true;
}

export function removekey(id: string): boolean {
  const key = store.keys.get(id);
  if (!key) return false;
  const blobhex = key.blob.toString("hex");
  store.blobindex.delete(blobhex);
  store.keys.delete(id);
  logusage(id, "remove");
  return true;
}

export function removekeybyblob(blob: Buffer): boolean {
  const blobhex = blob.toString("hex");
  const id = store.blobindex.get(blobhex);
  if (!id) return false;
  return removekey(id);
}

export function removeallkeys() {
  for (const id of store.keys.keys()) {
    logusage(id, "remove");
  }
  store.keys.clear();
  store.blobindex.clear();
}

export function listkeys(): { blob: Buffer; comment: string }[] {
  const now = Date.now();
  const result: { blob: Buffer; comment: string }[] = [];
  for (const key of store.keys.values()) {
    if (key.expires && key.expires < now) {
      removekey(key.id);
      continue;
    }
    result.push({ blob: key.blob, comment: key.comment });
  }
  return result;
}

export function listkeysdetailed(): LoadedKey[] {
  const now = Date.now();
  const result: LoadedKey[] = [];
  for (const key of store.keys.values()) {
    if (key.expires && key.expires < now) {
      removekey(key.id);
      continue;
    }
    result.push(key);
  }
  return result;
}

export function getkey(id: string): LoadedKey | undefined {
  const key = store.keys.get(id);
  if (!key) return undefined;
  if (key.expires && key.expires < Date.now()) {
    removekey(id);
    return undefined;
  }
  return key;
}

export function getkeybyblob(blob: Buffer): LoadedKey | undefined {
  const blobhex = blob.toString("hex");
  const id = store.blobindex.get(blobhex);
  if (!id) return undefined;
  return getkey(id);
}

export function signdata(key: LoadedKey, data: Buffer, flags: number): Buffer {
  logusage(key.id, "sign", { flags, datalen: data.length });
  if (key.keytype === "ed25519" && key.seed) {
    return signed25519(data, key.seed);
  }
  if (key.keytype === "rsa") {
    return signrsa(data, key.privatekey, flags);
  }
  if (key.keytype === "ecdsa" && key.curve) {
    return signecdsa(data, key.privatekey, key.curve);
  }
  return Buffer.alloc(0);
}

export function loadkeyfromfile(filepath: string, id: string, comment?: string): boolean {
  if (!existsSync(filepath)) return false;
  const privatekey = readFileSync(filepath, "utf-8");
  return addkey(id, privatekey, comment || filepath);
}

export function keyfingerprint(blob: Buffer): string {
  const crypto = require("crypto");
  const hash = crypto.createHash("sha256").update(blob).digest("base64");
  return `SHA256:${hash.replace(/=+$/, "")}`;
}

interface SessionApproval {
  keyid: string;
  approved: boolean;
  expires: number;
}

const sessionapprovals: Map<string, SessionApproval> = new Map();

export function requestapproval(keyid: string, sessionid: string): boolean {
  const key = getkey(keyid);
  if (!key || !key.requireapproval) return true;
  const approval = sessionapprovals.get(`${sessionid}:${keyid}`);
  if (approval && approval.approved && approval.expires > Date.now()) {
    return true;
  }
  return false;
}

export function grantapproval(keyid: string, sessionid: string, ttl: number = 300000) {
  sessionapprovals.set(`${sessionid}:${keyid}`, {
    keyid,
    approved: true,
    expires: Date.now() + ttl,
  });
  logusage(keyid, "approval_granted", { sessionid, ttl });
}

export function revokeapproval(keyid: string, sessionid: string) {
  sessionapprovals.delete(`${sessionid}:${keyid}`);
  logusage(keyid, "approval_revoked", { sessionid });
}
