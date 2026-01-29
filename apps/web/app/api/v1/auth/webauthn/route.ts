import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { listpasskeys, deletepasskey, renamepasskey } from "@/lib/webauthn";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const passkeys = await listpasskeys(session.user.id);

    return NextResponse.json({
      passkeys: passkeys.map((p) => ({
        id: p.id,
        name: p.name,
        devicetype: p.devicetype,
        backedup: p.backedup,
        createdat: p.createdat,
        lastused: p.lastused,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "failed to list passkeys" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name } = body;

    if (!id) {
      return NextResponse.json(
        { error: "passkey id is required" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    if (name.length > 64) {
      return NextResponse.json(
        { error: "name too long" },
        { status: 400 }
      );
    }

    const updated = await renamepasskey(session.user.id, id, name);

    if (!updated) {
      return NextResponse.json(
        { error: "passkey not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ updated: true });
  } catch {
    return NextResponse.json(
      { error: "failed to rename passkey" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "passkey id is required" },
        { status: 400 }
      );
    }

    const deleted = await deletepasskey(session.user.id, id);

    if (!deleted) {
      return NextResponse.json(
        { error: "passkey not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: "failed to delete passkey" },
      { status: 500 }
    );
  }
}
