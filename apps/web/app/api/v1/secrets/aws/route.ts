import { headers } from "next/headers";
import { json, error } from "@/lib/response";
import { auth } from "@/lib/auth";
import {
  createengine,
  getengine,
  deleteengine,
  generateawscreds,
  revokelease,
  getlease,
  type AwsConfig,
} from "@/lib/secrets/index";

interface ConfigPayload {
  name: string;
  rolearn: string;
  region: string;
  accesskey: string;
  secretkey: string;
  ttl?: number;
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return error("unauthorized", 401);
  }
  try {
    const body: ConfigPayload = await req.json();
    const { name, rolearn, region, accesskey, secretkey, ttl = 3600 } = body;
    if (!name || !rolearn || !region || !accesskey || !secretkey) {
      return error("missing required fields", 400);
    }
    if (!rolearn.startsWith("arn:aws:iam::")) {
      return error("invalid role arn", 400);
    }
    if (ttl < 900 || ttl > 43200) {
      return error("ttl must be between 900 and 43200 seconds", 400);
    }
    const config: AwsConfig = {
      rolearn,
      region,
      accesskey,
      secretkey,
      ttl,
    };
    const engine = await createengine(session.user.id, "aws", name, config);
    return json({
      id: engine.id,
      name: engine.name,
      type: engine.type,
      created: engine.created,
    });
  } catch {
    return error("failed to configure aws engine", 500);
  }
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return error("unauthorized", 401);
  }
  try {
    const url = new URL(req.url);
    const engineid = url.searchParams.get("engine");
    if (!engineid) {
      return error("engine id required", 400);
    }
    const engine = await getengine(session.user.id, engineid);
    if (!engine) {
      return error("engine not found", 404);
    }
    if (engine.type !== "aws") {
      return error("not an aws engine", 400);
    }
    const lease = await generateawscreds(engine);
    return json({
      leaseid: lease.id,
      accesskey: lease.credentials.accesskey,
      secretkey: lease.credentials.secretkey,
      sessiontoken: lease.credentials.sessiontoken,
      expiration: lease.credentials.expiration,
      expires: lease.expires,
      ttl: Math.floor((lease.expires - Date.now()) / 1000),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "failed to generate credentials";
    return error(msg, 500);
  }
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return error("unauthorized", 401);
  }
  try {
    const url = new URL(req.url);
    const engineid = url.searchParams.get("engine");
    const leaseid = url.searchParams.get("lease");
    if (leaseid) {
      const lease = await getlease(leaseid);
      if (!lease) {
        return error("lease not found", 404);
      }
      await revokelease(leaseid);
      return json({ revoked: true });
    }
    if (engineid) {
      const deleted = await deleteengine(session.user.id, engineid);
      if (!deleted) {
        return error("engine not found", 404);
      }
      return json({ deleted: true });
    }
    return error("engine or lease id required", 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "failed to delete";
    return error(msg, 500);
  }
}
