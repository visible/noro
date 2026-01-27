import { redis, type StoredSecret } from "@/lib/redis";
import { validate, extractkey, checklimit } from "@/lib/apikey";
import { send } from "@/lib/webhook";
import { json, error } from "@/lib/response";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const { id } = await params;
    const raw = await redis.get<string>(id);
    if (!raw) {
      return error("not found", 404, limit);
    }
    let secret: StoredSecret;
    try {
      secret = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      secret = { data: raw as string, type: "text", views: 1, viewed: 0 };
    }
    secret.viewed += 1;
    const remaining = Math.max(0, secret.views - secret.viewed);
    if (secret.viewed >= secret.views) {
      await redis.del(id);
      if (apikey.webhook) {
        await send(apikey.webhook, "secret.expired", id);
      }
    } else {
      await redis.set(id, JSON.stringify(secret), { keepTtl: true });
      if (apikey.webhook) {
        await send(apikey.webhook, "secret.viewed", id);
      }
    }
    return json({
      data: secret.data,
      type: secret.type,
      filename: secret.filename,
      mimetype: secret.mimetype,
      remaining,
    }, 200, limit);
  } catch {
    return error("failed", 500, limit);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const { id } = await params;
    const exists = await redis.exists(id);
    if (!exists) {
      return error("not found", 404, limit);
    }
    await redis.del(id);
    return json({ deleted: true }, 200, limit);
  } catch {
    return error("failed", 500, limit);
  }
}
