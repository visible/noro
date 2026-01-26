import { NextResponse } from "next/server";
import { redis, type StoredSecret } from "@/lib/redis";
import { validate, extractkey, apilimit } from "@/lib/apikey";
import { send } from "@/lib/webhook";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const key = extractkey(req);
  if (!key) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const apikey = await validate(key);
  if (!apikey) {
    return NextResponse.json({ error: "invalid api key" }, { status: 401 });
  }
  const { success } = await apilimit.limit(key);
  if (!success) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }
  try {
    const { id } = await params;
    const raw = await redis.get<string>(`secret:${id}`);
    if (!raw) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
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
      await redis.del(`secret:${id}`);
      if (apikey.webhook) {
        await send(apikey.webhook, "secret.expired", id);
      }
    } else {
      await redis.set(`secret:${id}`, JSON.stringify(secret), { keepTtl: true });
      if (apikey.webhook) {
        await send(apikey.webhook, "secret.viewed", id);
      }
    }
    return NextResponse.json({
      data: secret.data,
      type: secret.type,
      filename: secret.filename,
      mimetype: secret.mimetype,
      remaining,
    });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const key = extractkey(req);
  if (!key) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const apikey = await validate(key);
  if (!apikey) {
    return NextResponse.json({ error: "invalid api key" }, { status: 401 });
  }
  const { success } = await apilimit.limit(key);
  if (!success) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }
  try {
    const { id } = await params;
    const exists = await redis.exists(`secret:${id}`);
    if (!exists) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    await redis.del(`secret:${id}`);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
