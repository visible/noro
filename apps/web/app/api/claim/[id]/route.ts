import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

interface StoredSecret {
  data: string;
  type: "text" | "file";
  filename?: string;
  mimetype?: string;
  views: number;
  viewed: number;
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const randomdelay = 100 + Math.random() * 200;
  await delay(randomdelay);

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
      await redis.set(id, JSON.stringify(secret), { keepttl: true });
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
