import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { validate, extractkey, apilimit } from "@/lib/apikey";
import { send } from "@/lib/webhook";

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

interface CreatePayload {
  data: string;
  ttl?: string;
  type?: "text" | "file";
  filename?: string;
  mimetype?: string;
  views?: number;
}

const maxsize = 5 * 1024 * 1024;

export async function POST(req: Request) {
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
    const body: CreatePayload = await req.json();
    const { data, ttl, type = "text", filename, mimetype, views = 1 } = body;
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
    });
    await redis.set(`secret:${id}`, payload, { ex });
    if (apikey.webhook) {
      await send(apikey.webhook, "secret.created", id);
    }
    const baseurl = process.env.NEXT_PUBLIC_APP_URL || "https://noro.sh";
    return NextResponse.json({ id, url: `${baseurl}/${id}` });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
