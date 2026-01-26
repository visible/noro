import { NextResponse } from "next/server";
import { create, validate, update, remove, extractkey, apilimit } from "@/lib/apikey";

interface KeysPayload {
  webhook?: string;
}

export async function POST(req: Request) {
  try {
    const body: KeysPayload = await req.json().catch(() => ({}));
    const { webhook } = body;
    if (webhook && !isvalidurl(webhook)) {
      return NextResponse.json({ error: "invalid webhook url" }, { status: 400 });
    }
    const { key, expires } = await create(webhook);
    return NextResponse.json({ key, expires });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const key = extractkey(req);
  if (!key) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const apikey = await validate(key);
  if (!apikey) {
    return NextResponse.json({ error: "invalid api key" }, { status: 401 });
  }
  const { success } = await apilimit.limit(key);
  if (!success) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }
  try {
    const body: KeysPayload = await req.json().catch(() => ({}));
    const { webhook } = body;
    if (webhook !== undefined && webhook !== null && !isvalidurl(webhook)) {
      return NextResponse.json({ error: "invalid webhook url" }, { status: 400 });
    }
    const updates: { webhook?: string } = {};
    if (webhook !== undefined) {
      updates.webhook = webhook || undefined;
    }
    await update(key, updates);
    return NextResponse.json({ updated: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const key = extractkey(req);
  if (!key) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const apikey = await validate(key);
  if (!apikey) {
    return NextResponse.json({ error: "invalid api key" }, { status: 401 });
  }
  try {
    const deleted = await remove(key);
    if (!deleted) {
      return NextResponse.json({ error: "failed" }, { status: 500 });
    }
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

function isvalidurl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}
