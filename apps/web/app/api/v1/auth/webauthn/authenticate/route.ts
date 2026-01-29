import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import {
  generateauthoptions,
  verifyauthentication,
  type AuthenticationChallenge,
} from "@/lib/webauthn";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const discoverable = url.searchParams.get("discoverable") === "true";

    let userid: string | undefined;

    if (!discoverable) {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      userid = session.user.id;
    }

    const { options, challenge } = await generateauthoptions(userid);

    const challengekey = userid
      ? `webauthn:auth:${userid}`
      : `webauthn:auth:discoverable:${options.challenge}`;

    await redis.set(challengekey, JSON.stringify(challenge), { ex: 300 });

    return NextResponse.json({
      options,
      discoverable: !userid,
    });
  } catch (err) {
    console.error("webauthn auth options error:", err);
    return NextResponse.json(
      { error: "failed to generate authentication options" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { response, discoverable } = body;

    if (!response) {
      return NextResponse.json(
        { error: "response is required" },
        { status: 400 }
      );
    }

    let challengedata: string | null = null;
    let challengekey: string;

    if (discoverable) {
      challengekey = `webauthn:auth:discoverable:${response.rawId}`;
      const keys = await redis.keys("webauthn:auth:discoverable:*");
      for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
          const parsed = JSON.parse(data as string) as AuthenticationChallenge;
          if (parsed.challenge) {
            challengedata = data as string;
            challengekey = key;
            break;
          }
        }
      }
    } else {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      challengekey = `webauthn:auth:${session.user.id}`;
      challengedata = await redis.get(challengekey) as string | null;
    }

    if (!challengedata) {
      return NextResponse.json(
        { error: "no pending authentication" },
        { status: 400 }
      );
    }

    const challenge: AuthenticationChallenge = JSON.parse(challengedata);

    const result = await verifyauthentication(response, challenge);

    await redis.del(challengekey);

    if (!result.verified) {
      return NextResponse.json(
        { error: result.error || "verification failed" },
        { status: 400 }
      );
    }

    const hasprfoutput = !!result.prfoutput;

    return NextResponse.json({
      verified: true,
      userid: result.userid,
      credentialid: result.credentialid,
      prfsupported: hasprfoutput,
    });
  } catch (err) {
    console.error("webauthn auth error:", err);
    return NextResponse.json(
      { error: "authentication failed" },
      { status: 500 }
    );
  }
}
