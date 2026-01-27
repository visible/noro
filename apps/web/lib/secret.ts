import { chars } from "@/lib/chars";

export const ttls: Record<string, number> = {
  "1h": 3600,
  "6h": 21600,
  "12h": 43200,
  "1d": 86400,
  "7d": 604800,
};

export const maxsize = 5 * 1024 * 1024;

export function generateid(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id;
}
