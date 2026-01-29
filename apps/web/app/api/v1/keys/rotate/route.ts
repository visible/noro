import { validate, extractkey, checklimit } from "@/lib/apikey";
import { rotate, gethistory } from "@/lib/rotation";
import { json, error } from "@/lib/response";

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
    const result = await rotate(key, "manual");
    if (!result) {
      return error("rotation failed", 500, limit);
    }
    return json({
      oldKey: `noro_****${result.oldKey.slice(-4)}`,
      newKey: result.newKey,
      gracePeriodEnd: result.gracePeriodEnd,
    }, 200, limit);
  } catch {
    return error("failed", 500, limit);
  }
}

export async function GET(req: Request) {
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
    const history = await gethistory(key);
    return json({ history }, 200, limit);
  } catch {
    return error("failed", 500, limit);
  }
}
