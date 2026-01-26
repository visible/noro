import { NextResponse } from "next/server";
import { create } from "@/lib/apikey";

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
    const key = await create(webhook);
    return NextResponse.json({ key });
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
