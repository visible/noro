import { chars } from "@/lib/chars";

async function derivekey(key: string, usage: "encrypt" | "decrypt") {
  const keydata = new TextEncoder().encode(key.padEnd(32, "0").slice(0, 32));
  return crypto.subtle.importKey("raw", keydata, "AES-GCM", false, [usage]);
}

function tobase64url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function frombase64url(encoded: string): Uint8Array {
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

export async function encrypt(data: Uint8Array, key: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cryptokey = await derivekey(key, "encrypt");
  const buffer = new Uint8Array(data).buffer as ArrayBuffer;
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptokey,
    buffer
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return tobase64url(combined);
}

export async function decrypt(encrypted: string, key: string): Promise<Uint8Array> {
  const bytes = frombase64url(encrypted);
  const iv = bytes.slice(0, 12);
  const data = bytes.slice(12);
  const cryptokey = await derivekey(key, "decrypt");
  const buffer = new Uint8Array(data).buffer as ArrayBuffer;
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptokey,
    buffer
  );
  return new Uint8Array(decrypted);
}

export function generatekey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  let key = "";
  for (let i = 0; i < 24; i++) {
    key += chars[bytes[i] % chars.length];
  }
  return key;
}
