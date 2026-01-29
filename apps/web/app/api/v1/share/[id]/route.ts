import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function hashpassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface ShareParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: ShareParams) {
  try {
    const { id } = await params;

    const share = await db.share.findUnique({
      where: { id },
    });

    if (!share) {
      return NextResponse.json({ error: "share not found" }, { status: 404 });
    }

    if (share.revoked) {
      return NextResponse.json({ error: "share revoked" }, { status: 410 });
    }

    if (share.expiresAt < new Date()) {
      return NextResponse.json({ error: "share expired" }, { status: 410 });
    }

    if (share.viewCount >= share.maxViews) {
      return NextResponse.json({ error: "view limit reached" }, { status: 410 });
    }

    if (share.passwordHash) {
      const url = new URL(req.url);
      const password = url.searchParams.get("password");

      if (!password) {
        return NextResponse.json({
          error: "password required",
          requiresPassword: true,
          publicKey: share.publicKey,
        }, { status: 401 });
      }

      const hash = await hashpassword(password);
      if (hash !== share.passwordHash) {
        return NextResponse.json({ error: "invalid password" }, { status: 401 });
      }
    }

    await db.share.update({
      where: { id },
      data: { viewCount: share.viewCount + 1 },
    });

    return NextResponse.json({
      id: share.id,
      encryptedData: share.encryptedData,
      publicKey: share.publicKey,
      viewCount: share.viewCount + 1,
      maxViews: share.maxViews,
      expiresAt: share.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("share get error:", error);
    return NextResponse.json({ error: "failed to get share" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: ShareParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const share = await db.share.findUnique({
      where: { id },
    });

    if (!share) {
      return NextResponse.json({ error: "share not found" }, { status: 404 });
    }

    if (share.userId !== session.user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    if (share.revoked) {
      return NextResponse.json({ error: "share already revoked" }, { status: 400 });
    }

    await db.share.update({
      where: { id },
      data: { revoked: true },
    });

    return NextResponse.json({ success: true, revoked: true });
  } catch (error) {
    console.error("share revoke error:", error);
    return NextResponse.json({ error: "failed to revoke share" }, { status: 500 });
  }
}
