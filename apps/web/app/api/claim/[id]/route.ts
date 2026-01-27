import { NextResponse } from "next/server";
import { redis, delay, randomdelay, type StoredSecret } from "@/lib/redis";
import { claimlimit, getip } from "@/lib/ratelimit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ip = getip(req);
  const { success } = await claimlimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }
  await delay(randomdelay());

  try {
    const { id } = await params;
    const raw = await redis.get<string>(id);
    if (!raw) {
      return NextResponse.json({ exists: false });
    }
    let secret: StoredSecret;
    try {
      secret = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      secret = { data: raw as string, type: "text", views: 1, viewed: 0 };
    }
    secret.viewed += 1;
    if (secret.viewed >= secret.views) {
      await redis.del(id);
    } else {
      await redis.set(id, JSON.stringify(secret), { keepTtl: true });
    }
    const remaining = Math.max(0, secret.views - secret.viewed);
    return NextResponse.json({
      exists: true,
      data: secret.data,
      type: secret.type,
      filename: secret.filename,
      mimetype: secret.mimetype,
      remaining,
    });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
