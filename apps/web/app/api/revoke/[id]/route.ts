import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const exists = await redis.exists(id);
    if (!exists) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    await redis.del(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
