async function derivekey(key: string, usage: "encrypt" | "decrypt") {
  const keydata = new TextEncoder().encode(key.padEnd(32, "0").slice(0, 32));
  return crypto.subtle.importKey("raw", keydata, "AES-GCM", false, [usage]);
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
  return Buffer.from(combined).toString("base64url");
}

export async function decrypt(encoded: string, key: string): Promise<string> {
  const data = Buffer.from(encoded, "base64url");
  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);
  const cryptokey = await derivekey(key, "decrypt");
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptokey,
    encrypted
  );
  return new TextDecoder().decode(decrypted);
}
