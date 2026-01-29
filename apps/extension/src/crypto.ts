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

export async function encrypt(text: string, key: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cryptokey = await derivekey(key, "encrypt");
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptokey,
    data
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return tobase64url(combined);
}

export async function decrypt(encoded: string, key: string): Promise<string> {
  const bytes = frombase64url(encoded);
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

export function generatekey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  let key = "";
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 24; i++) {
    key += chars[bytes[i] % chars.length];
  }
  return key;
}

export function generatepassword(length = 20): string {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const symbols = "!@#$%^&*";
  const all = lower + upper + digits + symbols;

  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let password = "";

  password += lower[bytes[0] % lower.length];
  password += upper[bytes[1] % upper.length];
  password += digits[bytes[2] % digits.length];
  password += symbols[bytes[3] % symbols.length];

  for (let i = 4; i < length; i++) {
    password += all[bytes[i] % all.length];
  }

  const shuffled = password.split("");
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = bytes[i % bytes.length] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.join("");
}
