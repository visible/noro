import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const ttls: Record<string, number> = {
  "1h": 3600,
  "6h": 21600,
  "12h": 43200,
  "1d": 86400,
  "7d": 604800,
}

function generateid(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let id = ""
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

interface StorePayload {
  data: string
  ttl?: string
  type?: "text" | "file"
  filename?: string
  mimetype?: string
  views?: number
}

export async function POST(req: Request) {
  try {
    const body: StorePayload = await req.json()
    const { data, ttl, type = "text", filename, mimetype, views = 1 } = body
    if (!data || typeof data !== "string") {
      return NextResponse.json({ error: "invalid data" }, { status: 400 })
    }
    const clampedviews = Math.min(Math.max(views, 1), 5)
    const id = generateid()
    const ex = ttls[ttl || "1d"] || ttls["1d"]
    const payload = JSON.stringify({
      data,
      type,
      filename,
      mimetype,
      views: clampedviews,
      viewed: 0,
    })
    await redis.set(id, payload, { ex })
    return NextResponse.json({ id })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
