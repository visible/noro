import { redis } from "@/lib/redis"
import { NextResponse } from "next/server"

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
    const { data } = await req.json()
    if (!data || typeof data !== "string") {
      return NextResponse.json({ error: "invalid data" }, { status: 400 })
    }
    const id = generateid()
    await redis.set(`noro:${id}`, data, { ex: 60 * 60 * 24 })
    return NextResponse.json({ id })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
