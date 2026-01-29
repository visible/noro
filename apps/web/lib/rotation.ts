import { redis } from "@/lib/redis";
import { generate, validate, ApiKey } from "@/lib/apikey";
import { send } from "@/lib/webhook";

export type RotationInterval = "daily" | "weekly" | "monthly" | "custom";

export interface RotationPolicy {
  keyId: string;
  interval: number;
  notify: boolean;
  gracePeriod: number;
  autoRotate: boolean;
  lastRotation: number;
  nextRotation: number;
  createdAt: number;
}

export interface RotationHistory {
  id: string;
  keyId: string;
  oldKeyHint: string;
  newKeyHint: string;
  reason: "manual" | "policy" | "expired";
  rotatedAt: number;
  gracePeriodEnd: number | null;
}

export interface RotationResult {
  oldKey: string;
  newKey: string;
  gracePeriodEnd: number | null;
}

function generatehistoryid(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function getintervaldays(interval: RotationInterval, custom?: number): number {
  switch (interval) {
    case "daily": return 1;
    case "weekly": return 7;
    case "monthly": return 30;
    case "custom": return custom || 7;
  }
}

export async function createpolicy(
  keyId: string,
  options: {
    interval: number;
    notify?: boolean;
    gracePeriod?: number;
    autoRotate?: boolean;
  }
): Promise<RotationPolicy> {
  const now = Date.now();
  const policy: RotationPolicy = {
    keyId,
    interval: options.interval,
    notify: options.notify ?? true,
    gracePeriod: options.gracePeriod ?? 24,
    autoRotate: options.autoRotate ?? true,
    lastRotation: now,
    nextRotation: now + options.interval * 24 * 60 * 60 * 1000,
    createdAt: now,
  };
  await redis.set(`rotation:policy:${keyId}`, JSON.stringify(policy));
  return policy;
}

export async function getpolicy(keyId: string): Promise<RotationPolicy | null> {
  const raw = await redis.get<string>(`rotation:policy:${keyId}`);
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

export async function updatepolicy(
  keyId: string,
  updates: Partial<Omit<RotationPolicy, "keyId" | "createdAt">>
): Promise<RotationPolicy | null> {
  const existing = await getpolicy(keyId);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  if (updates.interval && updates.interval !== existing.interval) {
    updated.nextRotation = Date.now() + updates.interval * 24 * 60 * 60 * 1000;
  }
  await redis.set(`rotation:policy:${keyId}`, JSON.stringify(updated));
  return updated;
}

export async function deletepolicy(keyId: string): Promise<boolean> {
  const deleted = await redis.del(`rotation:policy:${keyId}`);
  return deleted > 0;
}

export async function rotate(
  keyId: string,
  reason: "manual" | "policy" | "expired" = "manual"
): Promise<RotationResult | null> {
  const apikey = await validate(keyId);
  if (!apikey) return null;

  const policy = await getpolicy(keyId);
  const gracePeriodHours = policy?.gracePeriod ?? 24;
  const now = Date.now();
  const gracePeriodEnd = gracePeriodHours > 0 ? now + gracePeriodHours * 60 * 60 * 1000 : null;

  const newKey = generate();
  const newExpires = apikey.expires;
  const newData: ApiKey = {
    webhook: apikey.webhook,
    created: now,
    expires: newExpires,
  };

  const ttl = Math.max(1, Math.floor((newExpires - now) / 1000));
  await redis.set(`apikey:${newKey}`, JSON.stringify(newData), { ex: ttl });

  if (gracePeriodEnd) {
    const graceTtl = Math.floor((gracePeriodEnd - now) / 1000);
    await redis.set(`apikey:${keyId}`, JSON.stringify({ ...apikey, deprecated: true }), { ex: graceTtl });
  } else {
    await redis.del(`apikey:${keyId}`);
  }

  const historyEntry: RotationHistory = {
    id: generatehistoryid(),
    keyId: newKey,
    oldKeyHint: `noro_****${keyId.slice(-4)}`,
    newKeyHint: `noro_****${newKey.slice(-4)}`,
    reason,
    rotatedAt: now,
    gracePeriodEnd,
  };
  await addhistory(keyId, historyEntry);

  if (policy) {
    await updatepolicy(newKey, {
      lastRotation: now,
      nextRotation: now + policy.interval * 24 * 60 * 60 * 1000,
    });
    await deletepolicy(keyId);

    if (policy.notify && apikey.webhook) {
      await sendrotationwebhook(apikey.webhook, keyId, newKey);
    }
  }

  return {
    oldKey: keyId,
    newKey,
    gracePeriodEnd,
  };
}

async function addhistory(keyId: string, entry: RotationHistory): Promise<void> {
  const historyKey = `rotation:history:${keyId}`;
  const existing = await redis.get<string>(historyKey);
  let history: RotationHistory[] = [];
  if (existing) {
    try {
      history = typeof existing === "string" ? JSON.parse(existing) : existing;
    } catch {
      history = [];
    }
  }
  history.unshift(entry);
  history = history.slice(0, 50);
  await redis.set(historyKey, JSON.stringify(history));
}

export async function gethistory(keyId: string): Promise<RotationHistory[]> {
  const raw = await redis.get<string>(`rotation:history:${keyId}`);
  if (!raw) return [];
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return [];
  }
}

export async function checkpolicies(): Promise<{ rotated: string[]; errors: string[] }> {
  const rotated: string[] = [];
  const errors: string[] = [];
  const now = Date.now();

  const keys = await redis.keys("rotation:policy:*");
  for (const key of keys) {
    const keyId = key.replace("rotation:policy:", "");
    const policy = await getpolicy(keyId);
    if (!policy || !policy.autoRotate) continue;
    if (policy.nextRotation > now) continue;

    try {
      const result = await rotate(keyId, "policy");
      if (result) {
        rotated.push(keyId);
      } else {
        errors.push(keyId);
      }
    } catch {
      errors.push(keyId);
    }
  }

  return { rotated, errors };
}

async function sendrotationwebhook(url: string, oldKey: string, newKey: string): Promise<void> {
  await send(url, "secret.expired", `rotation:${oldKey.slice(-8)}:${newKey.slice(-8)}`);
}

export function intervaltodays(interval: RotationInterval, custom?: number): number {
  return getintervaldays(interval, custom);
}
