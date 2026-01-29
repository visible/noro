import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import {
  generateregistrationoptions,
  verifyregistration,
  type RegistrationChallenge,
} from "@/lib/webauthn";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { options, challenge } = await generateregistrationoptions(
      session.user.id,
      session.user.email,
      session.user.name
    );

    await redis.set(
      `webauthn:register:${session.user.id}`,
      JSON.stringify(challenge),
      { ex: 300 }
    );

    return NextResponse.json({ options });
  } catch (err) {
    console.error("webauthn registration options error:", err);
    return NextResponse.json(
      { error: "failed to generate registration options" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { response, name } = body;

    if (!response) {
      return NextResponse.json(
        { error: "response is required" },
        { status: 400 }
      );
    }

    const challengedata = await redis.get(`webauthn:register:${session.user.id}`);
    if (!challengedata) {
      return NextResponse.json(
        { error: "no pending registration" },
        { status: 400 }
      );
    }

    const challenge: RegistrationChallenge = JSON.parse(challengedata as string);

    const result = await verifyregistration(response, challenge, name);

    await redis.del(`webauthn:register:${session.user.id}`);

    if (!result.verified) {
      return NextResponse.json(
        { error: result.error || "verification failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verified: true,
      passkey: {
        id: result.credential?.id,
        name: result.credential?.name,
        createdat: result.credential?.createdat,
        backedup: result.credential?.backedup,
        devicetype: result.credential?.devicetype,
      },
    });
  } catch (err) {
    console.error("webauthn registration error:", err);
    return NextResponse.json(
      { error: "registration failed" },
      { status: 500 }
    );
  }
}
