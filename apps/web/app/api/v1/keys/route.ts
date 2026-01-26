import { create, validate, update, remove, extractkey, checklimit } from "@/lib/apikey";
import { json, error } from "@/lib/response";

interface KeysPayload {
  webhook?: string;
}

export async function GET(req: Request) {
  const key = extractkey(req);
  if (!key) {
    return error("unauthorized", 401);
  }
  const apikey = await validate(key);
  if (!apikey) {
    return error("invalid api key", 401);
  }
  const limit = await checklimit(key);
  if (!limit.success) {
    return error("rate limited", 429, limit);
  }
  return json({
    hint: `noro_****${key.slice(-4)}`,
    webhook: apikey.webhook || null,
    created: apikey.created,
    expires: apikey.expires,
  }, 200, limit);
}

export async function POST(req: Request) {
  try {
    const body: KeysPayload = await req.json().catch(() => ({}));
    const { webhook } = body;
    if (webhook && !isvalidurl(webhook)) {
      return error("invalid webhook url", 400);
    }
    const { key, expires } = await create(webhook);
    return json({ key, expires });
  } catch {
    return error("failed", 500);
  }
}

export async function PATCH(req: Request) {
  const key = extractkey(req);
  if (!key) {
    return error("unauthorized", 401);
  }
  const apikey = await validate(key);
  if (!apikey) {
    return error("invalid api key", 401);
  }
  const limit = await checklimit(key);
  if (!limit.success) {
    return error("rate limited", 429, limit);
  }
  try {
    const body: KeysPayload = await req.json().catch(() => ({}));
    const { webhook } = body;
    if (webhook !== undefined && webhook !== null && webhook !== "" && !isvalidurl(webhook)) {
      return error("invalid webhook url", 400, limit);
    }
    const updates: { webhook?: string } = {};
    if (webhook !== undefined) {
      updates.webhook = webhook || undefined;
    }
    await update(key, updates);
    return json({ updated: true }, 200, limit);
  } catch {
    return error("failed", 500, limit);
  }
}

export async function DELETE(req: Request) {
  const key = extractkey(req);
  if (!key) {
    return error("unauthorized", 401);
  }
  const apikey = await validate(key);
  if (!apikey) {
    return error("invalid api key", 401);
  }
  try {
    const deleted = await remove(key);
    if (!deleted) {
      return error("failed", 500);
    }
    return json({ deleted: true });
  } catch {
    return error("failed", 500);
  }
}

function isvalidurl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}
