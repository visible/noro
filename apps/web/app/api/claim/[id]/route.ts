import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await redis.get<string>(id)
    if (!data) {
      return NextResponse.json({ error: "not found" }, { status: 404 })
    }
    await redis.del(id)
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
