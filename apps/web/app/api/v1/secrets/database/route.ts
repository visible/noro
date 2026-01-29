import { headers } from "next/headers";
import { json, error } from "@/lib/response";
import { auth } from "@/lib/auth";
import {
  createengine,
  getengine,
  deleteengine,
  generatedatabasecreds,
  revokedatabasecreds,
  getlease,
  type DatabaseConfig,
} from "@/lib/secrets/index";

interface ConfigPayload {
  name: string;
  type: "postgres" | "mysql";
  host: string;
  port: number;
  database: string;
  adminuser: string;
  adminpassword: string;
  ttl?: number;
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return error("unauthorized", 401);
  }
  try {
    const body: ConfigPayload = await req.json();
    const { name, type, host, port, database, adminuser, adminpassword, ttl = 3600 } = body;
    if (!name || !type || !host || !port || !database || !adminuser || !adminpassword) {
      return error("missing required fields", 400);
    }
    if (type !== "postgres" && type !== "mysql") {
      return error("invalid database type", 400);
    }
    if (ttl < 60 || ttl > 86400) {
      return error("ttl must be between 60 and 86400 seconds", 400);
    }
    const config: DatabaseConfig = {
      type,
      host,
      port,
      database,
      adminuser,
      adminpassword,
      ttl,
    };
    const engine = await createengine(session.user.id, "database", name, config);
    return json({
      id: engine.id,
      name: engine.name,
      type: engine.type,
      created: engine.created,
    });
  } catch {
    return error("failed to configure database engine", 500);
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
    if (engine.type !== "database") {
      return error("not a database engine", 400);
    }
    const lease = await generatedatabasecreds(engine);
    return json({
      leaseid: lease.id,
      username: lease.credentials.username,
      password: lease.credentials.password,
      host: lease.credentials.host,
      port: lease.credentials.port,
      database: lease.credentials.database,
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
    if (leaseid && engineid) {
      const engine = await getengine(session.user.id, engineid);
      if (!engine) {
        return error("engine not found", 404);
      }
      const lease = await getlease(leaseid);
      if (!lease) {
        return error("lease not found", 404);
      }
      if (lease.engineid !== engineid) {
        return error("lease does not belong to engine", 400);
      }
      await revokedatabasecreds(engine, lease);
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
