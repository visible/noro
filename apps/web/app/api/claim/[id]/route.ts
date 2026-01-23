import { redis } from "@/lib/redis"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await redis.get<string>(`noro:${id}`)
    if (!data) {
      return NextResponse.json({ error: "not found" }, { status: 404 })
    }
    await redis.del(`noro:${id}`)
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
