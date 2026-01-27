import { redis } from "@/lib/redis";
import { json } from "@/lib/response";

export async function GET() {
  try {
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;
    return json({
      status: "healthy",
      redis: "connected",
      latency,
      timestamp: Date.now(),
    });
  } catch {
    return json({
      status: "unhealthy",
      redis: "disconnected",
      timestamp: Date.now(),
    }, 503);
  }
}
