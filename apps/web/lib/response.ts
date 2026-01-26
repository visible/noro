import { NextResponse } from "next/server";
import { chars } from "@/lib/chars";

export function generateid(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let id = "req_";
  for (let i = 0; i < 16; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id;
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export function json(
  data: Record<string, unknown>,
  status = 200,
  ratelimit?: RateLimitInfo,
): NextResponse {
  const requestid = generateid();
  const headers: Record<string, string> = {
    "x-request-id": requestid,
  };
  if (ratelimit) {
    headers["x-ratelimit-limit"] = String(ratelimit.limit);
    headers["x-ratelimit-remaining"] = String(ratelimit.remaining);
    headers["x-ratelimit-reset"] = String(ratelimit.reset);
    if (status === 429) {
      headers["retry-after"] = String(Math.ceil((ratelimit.reset - Date.now()) / 1000));
    }
  }
  return NextResponse.json(data, { status, headers });
}

export function error(
  message: string,
  status: number,
  ratelimit?: RateLimitInfo,
): NextResponse {
  return json({ error: message }, status, ratelimit);
}
