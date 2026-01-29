import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chars } from "@/lib/chars";
import { hashpassword } from "@/lib/crypto";

function generateid(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let id = "";
  for (let i = 0; i < 16; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id;
}

function parseexpiry(hours: number): Date {
  const ms = hours * 60 * 60 * 1000;
  return new Date(Date.now() + ms);
}

interface CreateSharePayload {
  itemId: string;
  encryptedData: string;
  publicKey: string;
  expiresIn?: number;
  maxViews?: number;
  password?: string;
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body: CreateSharePayload = await req.json();
    const { itemId, encryptedData, publicKey, expiresIn = 24, maxViews = 1, password } = body;

    if (!itemId || !encryptedData || !publicKey) {
      return NextResponse.json({ error: "itemId, encryptedData, and publicKey required" }, { status: 400 });
    }

    const vault = await db.vault.findUnique({
      where: { userId: session.user.id },
    });

    if (!vault) {
      return NextResponse.json({ error: "vault not found" }, { status: 404 });
    }

    const item = await db.item.findFirst({
      where: {
        id: itemId,
        vaultId: vault.id,
        deleted: false,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "item not found" }, { status: 404 });
    }

    const clampedHours = Math.min(Math.max(expiresIn, 1), 168);
    const clampedViews = Math.min(Math.max(maxViews, 1), 100);

    const id = generateid();
    const expiresAt = parseexpiry(clampedHours);
    const passwordHash = password ? await hashpassword(password) : null;

    const share = await db.share.create({
      data: {
        id,
        userId: session.user.id,
        itemId,
        encryptedData,
        publicKey,
        expiresAt,
        maxViews: clampedViews,
        passwordHash,
      },
    });

    const baseurl = process.env.NEXT_PUBLIC_APP_URL || "https://noro.sh";

    return NextResponse.json({
      id: share.id,
      url: `${baseurl}/share/${share.id}`,
      expiresAt: share.expiresAt.toISOString(),
      maxViews: share.maxViews,
      requiresPassword: !!passwordHash,
    });
  } catch {
    return NextResponse.json({ error: "failed to create share" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const shares = await db.share.findMany({
      where: {
        userId: session.user.id,
        revoked: false,
      },
      select: {
        id: true,
        itemId: true,
        expiresAt: true,
        maxViews: true,
        viewCount: true,
        createdAt: true,
        passwordHash: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const baseurl = process.env.NEXT_PUBLIC_APP_URL || "https://noro.sh";

    const formatted = shares.map((share: {
      id: string;
      itemId: string;
      expiresAt: Date;
      maxViews: number;
      viewCount: number;
      createdAt: Date;
      passwordHash: string | null;
    }) => ({
      id: share.id,
      url: `${baseurl}/share/${share.id}`,
      itemId: share.itemId,
      expiresAt: share.expiresAt.toISOString(),
      maxViews: share.maxViews,
      viewCount: share.viewCount,
      expired: share.expiresAt < new Date(),
      exhausted: share.viewCount >= share.maxViews,
      requiresPassword: !!share.passwordHash,
      createdAt: share.createdAt.toISOString(),
    }));

    return NextResponse.json({ shares: formatted });
  } catch {
    return NextResponse.json({ error: "failed to list shares" }, { status: 500 });
  }
}
