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

export async function POST(req: Request) {
  try {
    const { data, ttl } = await req.json()
    if (!data || typeof data !== "string") {
      return NextResponse.json({ error: "invalid data" }, { status: 400 })
    }
    const id = generateid()
    const ex = ttls[ttl] || ttls["1d"]
    await redis.set(id, data, { ex })
    return NextResponse.json({ id })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
