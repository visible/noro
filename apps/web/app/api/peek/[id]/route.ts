import { NextResponse } from "next/server";
import { redis, delay, randomdelay, type StoredSecret } from "@/lib/redis";
import { peeklimit, getip } from "@/lib/ratelimit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ip = getip(req);
  const { success } = await peeklimit.limit(ip);
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
    if (secret.peek) {
      return NextResponse.json({
        exists: true,
        type: secret.type,
        filename: secret.filename,
        views: secret.views,
        viewed: secret.viewed,
        data: secret.data,
      });
    }
    return NextResponse.json({
      exists: true,
      type: secret.type,
      filename: secret.filename,
      views: secret.views,
      viewed: secret.viewed,
    });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
