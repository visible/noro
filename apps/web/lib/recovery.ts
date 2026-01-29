const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 12;

function tobase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

function generatecode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS[bytes[i] % CHARS.length];
  }
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
}

export function generatecodes(count: number): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(generatecode());
  }
  return codes;
}

export async function hashcode(code: string): Promise<string> {
  const normalized = code.replace(/-/g, "").toUpperCase();
  const data = new TextEncoder().encode(normalized);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return tobase64(new Uint8Array(buffer));
}

export async function verifycode(
  code: string,
  hashes: { hash: string; used: boolean }[]
): Promise<{ valid: boolean; index: number }> {
  const inputhash = await hashcode(code);
  for (let i = 0; i < hashes.length; i++) {
    if (hashes[i].hash === inputhash && !hashes[i].used) {
      return { valid: true, index: i };
    }
  }
  return { valid: false, index: -1 };
}

export function formatkit(
  email: string,
  secretkey: string,
  codes: string[]
): string {
  const date = new Date().toISOString().split("T")[0];
  const left = codes.slice(0, 5);
  const right = codes.slice(5, 10);
  const rows = left
    .map((l, i) => `${i + 1}. ${l}    ${i + 6}. ${right[i]}`)
    .join("\n");

  return `noro recovery kit
-----------------
generated: ${date}
email: ${email}
secret key: ${secretkey}

recovery codes (single-use):
${rows}

storage: print and store in safe. do not email or screenshot.`;
}
