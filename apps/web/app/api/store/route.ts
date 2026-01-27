import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { storelimit, getip } from "@/lib/ratelimit";
import { ttls, maxsize, generateid } from "@/lib/secret";

interface StorePayload {
  data: string;
  ttl?: string;
  type?: "text" | "file";
  filename?: string;
  mimetype?: string;
  views?: number;
  peek?: boolean;
}

export async function POST(req: Request) {
  const ip = getip(req);
  const { success } = await storelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }
  try {
    const body: StorePayload = await req.json();
    const { data, ttl, type = "text", filename, mimetype, views = 1, peek = false } = body;
    if (!data || typeof data !== "string") {
      return NextResponse.json({ error: "invalid data" }, { status: 400 });
    }
    const decodedsize = Math.ceil(data.length * 0.75);
    if (decodedsize > maxsize) {
      return NextResponse.json({ error: "file too large" }, { status: 413 });
    }
    const clampedviews = Math.min(Math.max(views, 1), 5);
    const id = generateid();
    const ex = ttls[ttl || "1d"] || ttls["1d"];
    const payload = JSON.stringify({
      data,
      type,
      filename,
      mimetype,
      views: clampedviews,
      viewed: 0,
      peek,
    });
    await redis.set(id, payload, { ex });
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
