import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifycode } from "@/lib/recovery";

interface VerifyPayload {
  email: string;
  code: string;
}

export async function POST(req: Request) {
  try {
    const body: VerifyPayload = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "email and code required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "invalid recovery code" },
        { status: 401 }
      );
    }

    const recoveryCodes = await db.recoveryCode.findMany({
      where: { userId: user.id },
      select: { id: true, hash: true, used: true },
    });

    if (recoveryCodes.length === 0) {
      return NextResponse.json(
        { error: "no recovery codes found" },
        { status: 401 }
      );
    }

    const result = await verifycode(
      code,
      recoveryCodes.map((c) => ({ hash: c.hash, used: c.used }))
    );

    if (!result.valid) {
      return NextResponse.json(
        { error: "invalid recovery code" },
        { status: 401 }
      );
    }

    await db.recoveryCode.update({
      where: { id: recoveryCodes[result.index].id },
      data: { used: true, usedAt: new Date() },
    });

    const remaining = recoveryCodes.filter((c) => !c.used).length - 1;

    return NextResponse.json({
      valid: true,
      userId: user.id,
      remaining,
    });
  } catch (error) {
    console.error("recovery verify error:", error);
    return NextResponse.json(
      { error: "verification failed" },
      { status: 500 }
    );
  }
}
