type algorithm = "SHA1" | "SHA256" | "SHA512";

type totpoptions = {
  algorithm?: algorithm;
  digits?: 6 | 8;
  period?: 30 | 60;
  timestamp?: number;
};

type totpconfig = {
  secret: string;
  issuer?: string;
  account?: string;
  algorithm: algorithm;
  digits: 6 | 8;
  period: 30 | 60;
};

const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32decode(encoded: string): Uint8Array {
  const cleaned = encoded.toUpperCase().replace(/[^A-Z2-7]/g, "");
  const bits: number[] = [];
  for (const char of cleaned) {
    const val = base32chars.indexOf(char);
    if (val === -1) continue;
    for (let i = 4; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | bits[i + j];
    }
    bytes.push(byte);
  }
  return new Uint8Array(bytes);
}

function base32encode(data: Uint8Array): string {
  const bits: number[] = [];
  for (let k = 0; k < data.length; k++) {
    const byte = data[k];
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }
  let result = "";
  for (let i = 0; i < bits.length; i += 5) {
    let val = 0;
    for (let j = 0; j < 5; j++) {
      val = (val << 1) | (bits[i + j] ?? 0);
    }
    result += base32chars[val];
  }
  const padding = (8 - (result.length % 8)) % 8;
  return result + "=".repeat(padding);
}

function algorithmname(alg: algorithm): string {
  return alg === "SHA1" ? "SHA-1" : alg === "SHA256" ? "SHA-256" : "SHA-512";
}

async function hmac(
  key: Uint8Array,
  message: Uint8Array,
  algorithm: algorithm
): Promise<Uint8Array> {
  const keybuffer = new Uint8Array(key).buffer as ArrayBuffer;
  const cryptokey = await crypto.subtle.importKey(
    "raw",
    keybuffer,
    { name: "HMAC", hash: algorithmname(algorithm) },
    false,
    ["sign"]
  );
  const msgbuffer = new Uint8Array(message).buffer as ArrayBuffer;
  const signature = await crypto.subtle.sign("HMAC", cryptokey, msgbuffer);
  return new Uint8Array(signature);
}

function uint64tobytes(value: number): Uint8Array {
  const bytes = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    bytes[i] = value & 0xff;
    value = Math.floor(value / 256);
  }
  return bytes;
}

function truncate(hash: Uint8Array, digits: number): string {
  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  const otp = binary % Math.pow(10, digits);
  return otp.toString().padStart(digits, "0");
}

export async function generatetotp(
  secret: string,
  options: totpoptions = {}
): Promise<string> {
  const algorithm = options.algorithm ?? "SHA1";
  const digits = options.digits ?? 6;
  const period = options.period ?? 30;
  const timestamp = options.timestamp ?? Date.now();
  const counter = Math.floor(timestamp / 1000 / period);
  const key = base32decode(secret);
  const message = uint64tobytes(counter);
  const hash = await hmac(key, message, algorithm);
  return truncate(hash, digits);
}

export function parseotpauth(url: string): totpconfig | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "otpauth:") return null;
    if (parsed.host !== "totp") return null;
    const path = decodeURIComponent(parsed.pathname.slice(1));
    const parts = path.split(":");
    const account = parts.length > 1 ? parts[1] : parts[0];
    const issuer =
      parsed.searchParams.get("issuer") ?? (parts.length > 1 ? parts[0] : undefined);
    const secret = parsed.searchParams.get("secret");
    if (!secret) return null;
    const algorithmParam = parsed.searchParams.get("algorithm")?.toUpperCase();
    let algorithm: algorithm = "SHA1";
    if (algorithmParam === "SHA256" || algorithmParam === "SHA-256") {
      algorithm = "SHA256";
    } else if (algorithmParam === "SHA512" || algorithmParam === "SHA-512") {
      algorithm = "SHA512";
    }
    const digitsParam = parsed.searchParams.get("digits");
    let digits: 6 | 8 = 6;
    if (digitsParam === "8") {
      digits = 8;
    }
    const periodParam = parsed.searchParams.get("period");
    let period: 30 | 60 = 30;
    if (periodParam === "60") {
      period = 60;
    }
    return { secret, issuer, account, algorithm, digits, period };
  } catch {
    return null;
  }
}

export function formatotpauth(config: totpconfig): string {
  const label = config.issuer
    ? `${encodeURIComponent(config.issuer)}:${encodeURIComponent(config.account ?? "")}`
    : encodeURIComponent(config.account ?? "");
  const params = new URLSearchParams();
  params.set("secret", config.secret);
  if (config.issuer) params.set("issuer", config.issuer);
  if (config.algorithm !== "SHA1") params.set("algorithm", config.algorithm);
  if (config.digits !== 6) params.set("digits", config.digits.toString());
  if (config.period !== 30) params.set("period", config.period.toString());
  return `otpauth://totp/${label}?${params.toString()}`;
}

export function timeremaining(period: 30 | 60 = 30): number {
  const now = Math.floor(Date.now() / 1000);
  return period - (now % period);
}

export function generatesecret(length: number = 20): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return base32encode(bytes);
}

export { base32decode, base32encode };
export type { algorithm, totpoptions, totpconfig };
