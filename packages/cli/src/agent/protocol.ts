import { createPublicKey, sign, createSign, constants } from "node:crypto";

export const SSH_AGENT_FAILURE = 5;
export const SSH_AGENT_SUCCESS = 6;
export const SSH_AGENTC_REQUEST_IDENTITIES = 11;
export const SSH_AGENT_IDENTITIES_ANSWER = 12;
export const SSH_AGENTC_SIGN_REQUEST = 13;
export const SSH_AGENT_SIGN_RESPONSE = 14;
export const SSH_AGENTC_ADD_IDENTITY = 17;
export const SSH_AGENTC_REMOVE_IDENTITY = 18;
export const SSH_AGENTC_REMOVE_ALL_IDENTITIES = 19;

export const SSH_AGENT_RSA_SHA2_256 = 0x02;
export const SSH_AGENT_RSA_SHA2_512 = 0x04;

export function readuint32(buf: Buffer, offset: number): number {
  return buf.readUInt32BE(offset);
}

export function writeuint32(value: number): Buffer {
  const buf = Buffer.alloc(4);
  buf.writeUInt32BE(value, 0);
  return buf;
}

export function readstring(buf: Buffer, offset: number): { value: Buffer; length: number } {
  const len = readuint32(buf, offset);
  const value = buf.subarray(offset + 4, offset + 4 + len);
  return { value, length: 4 + len };
}

export function writestring(data: Buffer | string): Buffer {
  const buf = typeof data === "string" ? Buffer.from(data) : data;
  return Buffer.concat([writeuint32(buf.length), buf]);
}

export function parsemessage(data: Buffer): { type: number; payload: Buffer } | null {
  if (data.length < 5) return null;
  const len = readuint32(data, 0);
  if (data.length < 4 + len) return null;
  const type = data[4];
  const payload = data.subarray(5, 4 + len);
  return { type, payload };
}

export function buildmessage(type: number, payload: Buffer = Buffer.alloc(0)): Buffer {
  const len = 1 + payload.length;
  return Buffer.concat([writeuint32(len), Buffer.from([type]), payload]);
}

export function buildidentities(keys: { blob: Buffer; comment: string }[]): Buffer {
  const parts: Buffer[] = [writeuint32(keys.length)];
  for (const key of keys) {
    parts.push(writestring(key.blob));
    parts.push(writestring(key.comment));
  }
  return buildmessage(SSH_AGENT_IDENTITIES_ANSWER, Buffer.concat(parts));
}

export function buildsignature(signature: Buffer): Buffer {
  return buildmessage(SSH_AGENT_SIGN_RESPONSE, writestring(signature));
}

export function buildfailure(): Buffer {
  return buildmessage(SSH_AGENT_FAILURE);
}

export function buildsuccess(): Buffer {
  return buildmessage(SSH_AGENT_SUCCESS);
}

export function parsekeyed25519(privatekey: string): { publickey: Buffer; privatekey: Buffer } | null {
  const lines = privatekey.split("\n").filter((l) => !l.startsWith("-----") && l.trim());
  const decoded = Buffer.from(lines.join(""), "base64");
  const marker = Buffer.from("openssh-key-v1\0");
  if (!decoded.subarray(0, marker.length).equals(marker)) return null;
  let offset = marker.length;
  const { length: cipherlen } = readstring(decoded, offset);
  offset += cipherlen;
  const { length: kdflen } = readstring(decoded, offset);
  offset += kdflen;
  const { length: kdfoptlen } = readstring(decoded, offset);
  offset += kdfoptlen;
  const numkeys = readuint32(decoded, offset);
  offset += 4;
  if (numkeys !== 1) return null;
  const { value: publicblob, length: publen } = readstring(decoded, offset);
  offset += publen;
  const { value: privateblob } = readstring(decoded, offset);
  let privoffset = 8;
  const { value: keytype, length: typelen } = readstring(privateblob, privoffset);
  privoffset += typelen;
  if (keytype.toString() !== "ssh-ed25519") return null;
  const { length: pubkeylen } = readstring(privateblob, privoffset);
  privoffset += pubkeylen;
  const { value: privdata } = readstring(privateblob, privoffset);
  const pubkey = privdata.subarray(32, 64);
  const seed = privdata.subarray(0, 32);
  return { publickey: pubkey, privatekey: seed };
}

export function parsekeyrsa(privatekey: string): { publickey: Buffer; privatekey: Buffer; keyobject: ReturnType<typeof createPublicKey> } | null {
  try {
    const key = createPublicKey({ key: privatekey, format: "pem" });
    const exported = key.export({ type: "spki", format: "der" });
    return { publickey: exported, privatekey: Buffer.from(privatekey), keyobject: key };
  } catch {
    return null;
  }
}

export function parsekeyecdsa(privatekey: string): { publickey: Buffer; privatekey: Buffer; curve: string } | null {
  const lines = privatekey.split("\n").filter((l) => !l.startsWith("-----") && l.trim());
  const decoded = Buffer.from(lines.join(""), "base64");
  const marker = Buffer.from("openssh-key-v1\0");
  if (!decoded.subarray(0, marker.length).equals(marker)) return null;
  let offset = marker.length;
  const { length: cipherlen } = readstring(decoded, offset);
  offset += cipherlen;
  const { length: kdflen } = readstring(decoded, offset);
  offset += kdflen;
  const { length: kdfoptlen } = readstring(decoded, offset);
  offset += kdfoptlen;
  const numkeys = readuint32(decoded, offset);
  offset += 4;
  if (numkeys !== 1) return null;
  const { value: publicblob, length: publen } = readstring(decoded, offset);
  offset += publen;
  const { value: privateblob } = readstring(decoded, offset);
  let privoffset = 8;
  const { value: keytype, length: typelen } = readstring(privateblob, privoffset);
  privoffset += typelen;
  const keytypestr = keytype.toString();
  if (!keytypestr.startsWith("ecdsa-sha2-")) return null;
  const { value: curve } = readstring(privateblob, privoffset);
  return { publickey: publicblob, privatekey: decoded, curve: curve.toString() };
}

export function detectkeytype(privatekey: string): "ed25519" | "rsa" | "ecdsa" | null {
  if (privatekey.includes("OPENSSH PRIVATE KEY")) {
    const lines = privatekey.split("\n").filter((l) => !l.startsWith("-----") && l.trim());
    const decoded = Buffer.from(lines.join(""), "base64");
    const marker = Buffer.from("openssh-key-v1\0");
    if (!decoded.subarray(0, marker.length).equals(marker)) return null;
    let offset = marker.length;
    const { length: cipherlen } = readstring(decoded, offset);
    offset += cipherlen;
    const { length: kdflen } = readstring(decoded, offset);
    offset += kdflen;
    const { length: kdfoptlen } = readstring(decoded, offset);
    offset += kdfoptlen;
    const numkeys = readuint32(decoded, offset);
    offset += 4;
    if (numkeys !== 1) return null;
    const { length: publen } = readstring(decoded, offset);
    offset += publen;
    const { value: privateblob } = readstring(decoded, offset);
    const { value: keytype } = readstring(privateblob, 8);
    const keytypestr = keytype.toString();
    if (keytypestr === "ssh-ed25519") return "ed25519";
    if (keytypestr.startsWith("ecdsa-sha2-")) return "ecdsa";
    if (keytypestr === "ssh-rsa") return "rsa";
    return null;
  }
  if (privatekey.includes("RSA PRIVATE KEY") || privatekey.includes("PRIVATE KEY")) {
    return "rsa";
  }
  return null;
}

export function publickeyblob(keytype: "ed25519" | "rsa" | "ecdsa", publickey: Buffer, privatekey: string): Buffer {
  if (keytype === "ed25519") {
    return Buffer.concat([writestring("ssh-ed25519"), writestring(publickey)]);
  }
  if (keytype === "rsa") {
    const key = createPublicKey({ key: privatekey, format: "pem" });
    const jwk = key.export({ format: "jwk" }) as { n: string; e: string };
    const n = Buffer.from(jwk.n, "base64url");
    const e = Buffer.from(jwk.e, "base64url");
    const npadded = n[0] & 0x80 ? Buffer.concat([Buffer.from([0]), n]) : n;
    const epadded = e[0] & 0x80 ? Buffer.concat([Buffer.from([0]), e]) : e;
    return Buffer.concat([writestring("ssh-rsa"), writestring(epadded), writestring(npadded)]);
  }
  if (keytype === "ecdsa") {
    return publickey;
  }
  return Buffer.alloc(0);
}

export function signed25519(data: Buffer, seed: Buffer): Buffer {
  const { sign: nacl } = require("crypto");
  const privatekey = Buffer.concat([seed, Buffer.alloc(32)]);
  const keypair = {
    publicKey: Buffer.alloc(32),
    secretKey: privatekey,
  };
  try {
    const sig = sign(null, data, {
      key: Buffer.concat([
        Buffer.from("302e020100300506032b657004220420", "hex"),
        seed,
      ]),
      format: "der",
      type: "pkcs8",
    });
    return Buffer.concat([writestring("ssh-ed25519"), writestring(sig)]);
  } catch {
    return Buffer.alloc(0);
  }
}

export function signrsa(data: Buffer, privatekey: string, flags: number): Buffer {
  const algo = flags & SSH_AGENT_RSA_SHA2_512 ? "sha512" : flags & SSH_AGENT_RSA_SHA2_256 ? "sha256" : "sha1";
  const algoid = flags & SSH_AGENT_RSA_SHA2_512 ? "rsa-sha2-512" : flags & SSH_AGENT_RSA_SHA2_256 ? "rsa-sha2-256" : "ssh-rsa";
  const signer = createSign(algo);
  signer.update(data);
  const sig = signer.sign({ key: privatekey, padding: constants.RSA_PKCS1_PADDING });
  return Buffer.concat([writestring(algoid), writestring(sig)]);
}

export function signecdsa(data: Buffer, privatekey: string, curve: string): Buffer {
  const algo = curve === "nistp521" ? "sha512" : curve === "nistp384" ? "sha384" : "sha256";
  const algoid = `ecdsa-sha2-${curve}`;
  const signer = createSign(algo);
  signer.update(data);
  const dersig = signer.sign(privatekey);
  let offset = 2;
  const rlen = dersig[offset + 1];
  const r = dersig.subarray(offset + 2, offset + 2 + rlen);
  offset = offset + 2 + rlen;
  const slen = dersig[offset + 1];
  const s = dersig.subarray(offset + 2, offset + 2 + slen);
  const rpad = r[0] === 0 ? r.subarray(1) : r;
  const spad = s[0] === 0 ? s.subarray(1) : s;
  const sigblob = Buffer.concat([writestring(rpad), writestring(spad)]);
  return Buffer.concat([writestring(algoid), writestring(sigblob)]);
}
