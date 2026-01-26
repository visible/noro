import { redis } from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";

const chars = "abcdefghijklmnopqrstuvwxyz0123456789";

export interface ApiKey {
  webhook?: string;
  created: number;
}

export function generate(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let key = "noro_";
  for (let i = 0; i < 32; i++) {
    key += chars[bytes[i] % chars.length];
  }
  return key;
}

export async function create(webhook?: string): Promise<string> {
  const key = generate();
  const data: ApiKey = {
    created: Date.now(),
  };
  if (webhook) {
    data.webhook = webhook;
  }
  await redis.set(`apikey:${key}`, JSON.stringify(data));
  return key;
}

export async function validate(key: string): Promise<ApiKey | null> {
  if (!key.startsWith("noro_") || key.length !== 37) {
    return null;
  }
  const raw = await redis.get<string>(`apikey:${key}`);
  if (!raw) {
    return null;
  }
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

export async function update(key: string, data: Partial<ApiKey>): Promise<boolean> {
  const existing = await validate(key);
  if (!existing) {
    return false;
  }
  const updated = { ...existing, ...data };
  await redis.set(`apikey:${key}`, JSON.stringify(updated));
  return true;
}

export const apilimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  prefix: "ratelimit:api",
});

export function extractkey(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return null;
  }
  return auth.slice(7);
}
