import { validate, extractkey, checklimit } from "@/lib/apikey";
import { createpolicy, getpolicy, updatepolicy, deletepolicy } from "@/lib/rotation";
import { json, error } from "@/lib/response";

interface PolicyPayload {
  interval?: number;
  notify?: boolean;
  gracePeriod?: number;
  autoRotate?: boolean;
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
    const policy = await getpolicy(key);
    if (!policy) {
      return json({ policy: null }, 200, limit);
    }
    return json({
      policy: {
        interval: policy.interval,
        notify: policy.notify,
        gracePeriod: policy.gracePeriod,
        autoRotate: policy.autoRotate,
        lastRotation: policy.lastRotation,
        nextRotation: policy.nextRotation,
        createdAt: policy.createdAt,
      },
    }, 200, limit);
  } catch {
    return error("failed", 500, limit);
  }
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
    const body: PolicyPayload = await req.json().catch(() => ({}));
    if (!body.interval || body.interval < 1) {
      return error("interval required (minimum 1 day)", 400, limit);
    }
    if (body.interval > 365) {
      return error("interval cannot exceed 365 days", 400, limit);
    }
    if (body.gracePeriod !== undefined && (body.gracePeriod < 0 || body.gracePeriod > 168)) {
      return error("grace period must be 0-168 hours", 400, limit);
    }
    const existing = await getpolicy(key);
    if (existing) {
      return error("policy already exists, use patch to update", 409, limit);
    }
    const policy = await createpolicy(key, {
      interval: body.interval,
      notify: body.notify,
      gracePeriod: body.gracePeriod,
      autoRotate: body.autoRotate,
    });
    return json({
      policy: {
        interval: policy.interval,
        notify: policy.notify,
        gracePeriod: policy.gracePeriod,
        autoRotate: policy.autoRotate,
        lastRotation: policy.lastRotation,
        nextRotation: policy.nextRotation,
        createdAt: policy.createdAt,
      },
    }, 201, limit);
  } catch {
    return error("failed", 500, limit);
  }
}

export async function PATCH(req: Request) {
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
    const body: PolicyPayload = await req.json().catch(() => ({}));
    if (body.interval !== undefined && (body.interval < 1 || body.interval > 365)) {
      return error("interval must be 1-365 days", 400, limit);
    }
    if (body.gracePeriod !== undefined && (body.gracePeriod < 0 || body.gracePeriod > 168)) {
      return error("grace period must be 0-168 hours", 400, limit);
    }
    const updates: Record<string, unknown> = {};
    if (body.interval !== undefined) updates.interval = body.interval;
    if (body.notify !== undefined) updates.notify = body.notify;
    if (body.gracePeriod !== undefined) updates.gracePeriod = body.gracePeriod;
    if (body.autoRotate !== undefined) updates.autoRotate = body.autoRotate;
    const policy = await updatepolicy(key, updates);
    if (!policy) {
      return error("policy not found", 404, limit);
    }
    return json({
      policy: {
        interval: policy.interval,
        notify: policy.notify,
        gracePeriod: policy.gracePeriod,
        autoRotate: policy.autoRotate,
        lastRotation: policy.lastRotation,
        nextRotation: policy.nextRotation,
        createdAt: policy.createdAt,
      },
    }, 200, limit);
  } catch {
    return error("failed", 500, limit);
  }
}

export async function DELETE(req: Request) {
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
    const deleted = await deletepolicy(key);
    if (!deleted) {
      return error("policy not found", 404, limit);
    }
    return json({ deleted: true }, 200, limit);
  } catch {
    return error("failed", 500, limit);
  }
}
