import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;
    return NextResponse.json({
      status: "healthy",
      redis: "connected",
      latency,
      timestamp: Date.now(),
    });
  } catch {
    return NextResponse.json(
      {
        status: "unhealthy",
        redis: "disconnected",
        timestamp: Date.now(),
      },
      { status: 503 },
    );
  }
}
