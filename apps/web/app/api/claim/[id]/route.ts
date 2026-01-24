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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const raw = await redis.get<string>(id);
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
    if (secret.viewed >= secret.views) {
      await redis.del(id);
    } else {
      await redis.set(id, JSON.stringify(secret), { keepttl: true });
    }
    const remaining = Math.max(0, secret.views - secret.viewed);
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
