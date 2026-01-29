import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generatecodes, hashcode, formatkit } from "@/lib/recovery";

const CODE_COUNT = 10;

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, encryptedKey: true },
    });

    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    await db.recoveryCode.deleteMany({
      where: { userId: session.user.id },
    });

    const codes = generatecodes(CODE_COUNT);
    const hashes = await Promise.all(codes.map(hashcode));

    await db.recoveryCode.createMany({
      data: hashes.map((hash) => ({
        userId: session.user.id,
        hash,
        used: false,
      })),
    });

    const kit = formatkit(
      user.email,
      user.encryptedKey || "not set",
      codes
    );

    return NextResponse.json({
      codes,
      kit,
      count: codes.length,
    });
  } catch {
    return NextResponse.json(
      { error: "failed to generate recovery codes" },
      { status: 500 }
    );
  }
}
