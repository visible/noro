const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randombytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

function tobase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function frombase64(encoded: string): Uint8Array {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padding);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function derivekey(
  key: string,
  usage: "encrypt" | "decrypt"
): Promise<CryptoKey> {
  const keydata = new TextEncoder().encode(key.padEnd(32, "0").slice(0, 32));
  return crypto.subtle.importKey("raw", keydata, "AES-GCM", false, [usage]);
}

export async function encrypt(data: string, key: string): Promise<string> {
  const iv = randombytes(12);
  const cryptokey = await derivekey(key, "encrypt");
  const encoded = new TextEncoder().encode(data);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptokey,
    encoded
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return tobase64(combined);
}

export async function decrypt(encrypted: string, key: string): Promise<string> {
  const bytes = frombase64(encrypted);
  const iv = bytes.slice(0, 12);
  const data = bytes.slice(12);
  const cryptokey = await derivekey(key, "decrypt");
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptokey,
    data
  );
  return new TextDecoder().decode(decrypted);
}

export function generatekey(length = 24): string {
  const bytes = randombytes(length);
  let key = "";
  for (let i = 0; i < length; i++) {
    key += CHARS[bytes[i] % CHARS.length];
  }
  return key;
}

export async function hash(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return tobase64(new Uint8Array(hashBuffer));
}

export type EncryptedVault = {
  data: string;
  iv: string;
  version: number;
};

export async function encryptvault(
  vault: unknown,
  key: string
): Promise<EncryptedVault> {
  const json = JSON.stringify(vault);
  const encrypted = await encrypt(json, key);
  return {
    data: encrypted,
    iv: encrypted.slice(0, 16),
    version: 1,
  };
}

export async function decryptvault<T>(
  encrypted: EncryptedVault,
  key: string
): Promise<T> {
  const json = await decrypt(encrypted.data, key);
  return JSON.parse(json) as T;
}
