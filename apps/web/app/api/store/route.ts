import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { storelimit, getip } from "@/lib/ratelimit";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const ttls: Record<string, number> = {
  "1h": 3600,
  "6h": 21600,
  "12h": 43200,
  "1d": 86400,
  "7d": 604800,
};

function generateid(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id;
}

interface StorePayload {
  data: string;
  ttl?: string;
  type?: "text" | "file";
  filename?: string;
  mimetype?: string;
  views?: number;
  peek?: boolean;
}

const maxsize = 5 * 1024 * 1024;

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
