import { chars } from "@/lib/chars";
import { redis } from "@/lib/redis";
import type { SecretEngine, SecretLease, EngineType, DatabaseConfig, AwsConfig } from "./types";

export function generateid(prefix: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let id = prefix;
  for (let i = 0; i < 16; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id;
}

export function generatepassword(length = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length];
  }
  return password;
}

export function generateusername(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let name = "noro_";
  for (let i = 0; i < 8; i++) {
    name += chars[bytes[i] % chars.length];
  }
  return name;
}

export async function createengine(
  userid: string,
  type: EngineType,
  name: string,
  config: DatabaseConfig | AwsConfig
): Promise<SecretEngine> {
  const id = generateid("eng_");
  const engine: SecretEngine = {
    id,
    type,
    name,
    config,
    userid,
    created: Date.now(),
  };
  await redis.set(`engine:${userid}:${id}`, JSON.stringify(engine));
  await redis.sadd(`engines:${userid}`, id);
  return engine;
}

export async function getengine(userid: string, id: string): Promise<SecretEngine | null> {
  const raw = await redis.get<string>(`engine:${userid}:${id}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function listengines(userid: string): Promise<SecretEngine[]> {
  const ids = await redis.smembers<string[]>(`engines:${userid}`);
  if (!ids || ids.length === 0) return [];
  const engines: SecretEngine[] = [];
  for (const id of ids) {
    const engine = await getengine(userid, id);
    if (engine) engines.push(engine);
  }
  return engines;
}

export async function deleteengine(userid: string, id: string): Promise<boolean> {
  const engine = await getengine(userid, id);
  if (!engine) return false;
  await redis.del(`engine:${userid}:${id}`);
  await redis.srem(`engines:${userid}`, id);
  return true;
}

export async function createlease(
  engineid: string,
  credentials: Record<string, string>,
  ttl: number
): Promise<SecretLease> {
  const id = generateid("lease_");
  const lease: SecretLease = {
    id,
    engineid,
    credentials,
    expires: Date.now() + ttl * 1000,
    revoked: false,
    created: Date.now(),
  };
  await redis.set(`lease:${id}`, JSON.stringify(lease), { ex: ttl });
  await redis.sadd(`leases:${engineid}`, id);
  return lease;
}

export async function getlease(id: string): Promise<SecretLease | null> {
  const raw = await redis.get<string>(`lease:${id}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function revokelease(id: string): Promise<boolean> {
  const lease = await getlease(id);
  if (!lease) return false;
  lease.revoked = true;
  await redis.set(`lease:${id}`, JSON.stringify(lease), { keepTtl: true });
  return true;
}
