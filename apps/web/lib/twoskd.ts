import { argon2id } from "hash-wasm";

const ARGON_MEMORY = 65536;
const ARGON_ITERATIONS = 3;
const ARGON_PARALLELISM = 4;
const SECRET_KEY_BYTES = 20;
const NONCE_LEN = 12;
const BASE32_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function base32encode(bytes: Uint8Array): string {
  let result = "";
  let bits = 0;
  let bitcount = 0;
  for (const byte of bytes) {
    bits = (bits << 8) | byte;
    bitcount += 8;
    while (bitcount >= 5) {
      bitcount -= 5;
      const index = (bits >> bitcount) & 0x1f;
      result += BASE32_ALPHABET[index];
    }
  }
  if (bitcount > 0) {
    const index = (bits << (5 - bitcount)) & 0x1f;
    result += BASE32_ALPHABET[index];
  }
  return result;
}

function base32decode(encoded: string): Uint8Array | null {
  const result: number[] = [];
  let bits = 0;
  let bitcount = 0;
  for (const c of encoded) {
    const index = BASE32_ALPHABET.indexOf(c);
    if (index === -1) return null;
    bits = (bits << 5) | index;
    bitcount += 5;
    if (bitcount >= 8) {
      bitcount -= 8;
      result.push((bits >> bitcount) & 0xff);
    }
  }
  return new Uint8Array(result);
}

export function generatesecretkey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SECRET_KEY_BYTES));
  const encoded = base32encode(bytes);
  return `A3-${encoded.slice(0, 6)}-${encoded.slice(6, 12)}-${encoded.slice(12, 17)}-${encoded.slice(17, 22)}-${encoded.slice(22, 27)}-${encoded.slice(27)}`;
}

function parsesecretkey(secretkey: string): Uint8Array {
  if (!secretkey.startsWith("A3-")) {
    throw new Error("invalid secret key format");
  }
  const parts = secretkey.slice(3).split("-");
  if (parts.length !== 6) {
    throw new Error("invalid secret key format");
  }
  const encoded = parts.join("");
  const decoded = base32decode(encoded);
  if (!decoded) {
    throw new Error("invalid secret key format");
  }
  return decoded;
}

function hextoarray(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

export async function deriveauk(
  password: string,
  secretkey: string,
  salt: Uint8Array
): Promise<Uint8Array> {
  const keybytes = parsesecretkey(secretkey);
  const passbytes = new TextEncoder().encode(password);
  const combined = new Uint8Array(passbytes.length + keybytes.length);
  combined.set(passbytes);
  combined.set(keybytes, passbytes.length);
  const hash = await argon2id({
    password: combined,
    salt,
    parallelism: ARGON_PARALLELISM,
    iterations: ARGON_ITERATIONS,
    memorySize: ARGON_MEMORY,
    hashLength: 32,
    outputType: "hex",
  });
  return hextoarray(hash);
}

export async function wrapvaultkey(
  vaultkey: Uint8Array,
  auk: Uint8Array
): Promise<Uint8Array> {
  const aukbuffer = new Uint8Array(auk).buffer as ArrayBuffer;
  const key = await crypto.subtle.importKey("raw", aukbuffer, "AES-GCM", false, [
    "encrypt",
  ]);
  const nonce = crypto.getRandomValues(new Uint8Array(NONCE_LEN));
  const vaultkeybuffer = new Uint8Array(vaultkey).buffer as ArrayBuffer;
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    key,
    vaultkeybuffer
  );
  const wrapped = new Uint8Array(NONCE_LEN + ciphertext.byteLength);
  wrapped.set(nonce);
  wrapped.set(new Uint8Array(ciphertext), NONCE_LEN);
  return wrapped;
}

export async function unwrapvaultkey(
  wrapped: Uint8Array,
  auk: Uint8Array
): Promise<Uint8Array> {
  const aukbuffer = new Uint8Array(auk).buffer as ArrayBuffer;
  const key = await crypto.subtle.importKey("raw", aukbuffer, "AES-GCM", false, [
    "decrypt",
  ]);
  const nonce = wrapped.slice(0, NONCE_LEN);
  const ciphertextbuffer = new Uint8Array(wrapped.slice(NONCE_LEN)).buffer as ArrayBuffer;
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce },
    key,
    ciphertextbuffer
  );
  return new Uint8Array(plaintext);
}

export async function deriveitemkey(
  vaultkey: Uint8Array,
  itemid: string
): Promise<Uint8Array> {
  const salt = new TextEncoder().encode(itemid);
  const hash = await argon2id({
    password: vaultkey,
    salt,
    parallelism: 1,
    iterations: 1,
    memorySize: 4096,
    hashLength: 32,
    outputType: "hex",
  });
  return hextoarray(hash);
}
