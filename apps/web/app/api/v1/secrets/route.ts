import { redis } from "@/lib/redis";
import { validate, extractkey, checklimit } from "@/lib/apikey";
import { send } from "@/lib/webhook";
import { json, error } from "@/lib/response";
import { ttls, maxsize, generateid } from "@/lib/secret";

interface CreatePayload {
  data: string;
  ttl?: string;
  type?: "text" | "file";
  filename?: string;
  mimetype?: string;
  views?: number;
}

export async function POST(req: Request) {
  const key = extractkey(req);
  if (!key) {
    return error("unauthorized", 401);
  }
  const apikey = await validate(key);
  if (!apikey) {
    return error("invalid api key", 401);
  }
  const limit = await checklimit(key);
  if (!limit.success) {
    return error("rate limited", 429, limit);
  }
  try {
    const body: CreatePayload = await req.json();
    const { data, ttl, type = "text", filename, mimetype, views = 1 } = body;
    if (!data || typeof data !== "string") {
      return error("invalid data", 400, limit);
    }
    const decodedsize = Math.ceil(data.length * 0.75);
    if (decodedsize > maxsize) {
      return error("file too large", 413, limit);
    }
    const clampedviews = Math.min(Math.max(views, 1), 5);
    const id = generateid();
    const ex = ttls[ttl || "1d"] || ttls["1d"];
    const payload = JSON.stringify({
      data,
      type,
      filename,
      mimetype,
      views: clampedviews,
      viewed: 0,
    });
    await redis.set(id, payload, { ex });
    if (apikey.webhook) {
      await send(apikey.webhook, "secret.created", id);
    }
    const baseurl = process.env.NEXT_PUBLIC_APP_URL || "https://noro.sh";
    return json({ id, url: `${baseurl}/${id}` }, 200, limit);
  } catch {
    return error("failed", 500, limit);
  }
}
