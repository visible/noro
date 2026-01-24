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
    return NextResponse.json({
      exists: true,
      type: secret.type,
      filename: secret.filename,
      views: secret.views,
      viewed: secret.viewed,
    });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
