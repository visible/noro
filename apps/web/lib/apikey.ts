import { redis } from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { chars } from "@/lib/chars";

const defaultttl = 90 * 24 * 60 * 60;

export interface ApiKey {
  webhook?: string;
  created: number;
  expires: number;
}

export function generate(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let key = "noro_";
  for (let i = 0; i < 32; i++) {
    key += chars[bytes[i] % chars.length];
  }
  return key;
}

export async function create(webhook?: string, ttl?: number): Promise<{ key: string; expires: number }> {
  const key = generate();
  const ex = ttl || defaultttl;
  const expires = Date.now() + ex * 1000;
  const data: ApiKey = {
    created: Date.now(),
    expires,
  };
  if (webhook) {
    data.webhook = webhook;
  }
  await redis.set(`apikey:${key}`, JSON.stringify(data), { ex });
  return { key, expires };
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

export async function update(key: string, data: Partial<Omit<ApiKey, "created" | "expires">>): Promise<boolean> {
  const existing = await validate(key);
  if (!existing) {
    return false;
  }
  const updated = { ...existing, ...data };
  await redis.set(`apikey:${key}`, JSON.stringify(updated), { keepTtl: true });
  return true;
}

export async function remove(key: string): Promise<boolean> {
  if (!key.startsWith("noro_") || key.length !== 37) {
    return false;
  }
  const deleted = await redis.del(`apikey:${key}`);
  return deleted > 0;
}

const ratelimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  prefix: "ratelimit:api",
});

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function checklimit(key: string): Promise<RateLimitResult> {
  const result = await ratelimiter.limit(key);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export function extractkey(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return null;
  }
  return auth.slice(7);
}
