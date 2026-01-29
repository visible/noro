import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { download, upload } from "@/lib/r2";
import { canread, canwrite, teamvaultkey, type TeamRole } from "@/lib/teams";
import { validateitemdata, isvaliditemtype } from "@/lib/validate";

const json = NextResponse.json;

async function getmember(teamId: string, userId: string) {
  return db.teamMember.findUnique({ where: { teamId_userId: { teamId, userId } } });
}

async function getorvault(teamId: string) {
  let vault = await db.teamVault.findUnique({ where: { teamId } });
  if (!vault) {
    const blobKey = teamvaultkey(teamId);
    const emptyVault = Buffer.from(JSON.stringify({ items: [], version: 1 }));
    await upload(blobKey, emptyVault);
    vault = await db.teamVault.create({ data: { teamId, blobKey, revision: 1, size: emptyVault.length } });
  }
  return vault;
}

async function audit(teamId: string, userId: string, action: string, details?: object) {
  const h = await headers();
  await db.teamAuditLog.create({
    data: { teamId, userId, action, details: details ? JSON.stringify(details) : null, ip: h.get("x-forwarded-for") || h.get("x-real-ip") },
  });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return json({ error: "unauthorized" }, { status: 401 });
    const { id } = await params;
    const member = await getmember(id, session.user.id);
    if (!member || member.status !== "accepted") return json({ error: "team not found" }, { status: 404 });
    if (!canread(member.role as TeamRole)) return json({ error: "permission denied" }, { status: 403 });
    const vault = await getorvault(id);
    const url = new URL(req.url);
    if (url.searchParams.get("format") === "blob") {
      const data = await download(vault.blobKey);
      if (!data) return json({ error: "vault data not found" }, { status: 404 });
      return json({ data: data.toString("base64"), revision: vault.revision });
    }
    const type = url.searchParams.get("type");
    const items = await db.teamItem.findMany({
      where: { vaultId: vault.id, ...(type ? { type: type as never } : {}) },
      orderBy: { updatedAt: "desc" },
    });
    return json({ items, revision: vault.revision });
  } catch {
    return json({ error: "failed to get vault" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return json({ error: "unauthorized" }, { status: 401 });
    const { id } = await params;
    const member = await getmember(id, session.user.id);
    if (!member || member.status !== "accepted") return json({ error: "team not found" }, { status: 404 });
    if (!canwrite(member.role as TeamRole)) return json({ error: "permission denied" }, { status: 403 });
    const vault = await getorvault(id);
    const { type, title, data } = await req.json();
    if (!type || !title || !data) return json({ error: "type, title, and data required" }, { status: 400 });
    if (!isvaliditemtype(type)) return json({ error: "invalid item type" }, { status: 400 });
    const validation = validateitemdata(type, data);
    if (!validation.valid) return json({ error: validation.error }, { status: 400 });
    const item = await db.teamItem.create({
      data: { vaultId: vault.id, type, title, data: typeof data === "string" ? data : JSON.stringify(data), createdBy: session.user.id },
    });
    await db.teamVault.update({ where: { id: vault.id }, data: { revision: vault.revision + 1 } });
    await audit(id, session.user.id, "item.created", { itemId: item.id, type, title });
    return json({ item });
  } catch {
    return json({ error: "failed to create item" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return json({ error: "unauthorized" }, { status: 401 });
    const { id } = await params;
    const member = await getmember(id, session.user.id);
    if (!member || member.status !== "accepted") return json({ error: "team not found" }, { status: 404 });
    if (!canwrite(member.role as TeamRole)) return json({ error: "permission denied" }, { status: 403 });
    const vault = await getorvault(id);
    const { itemId, title, data, revision } = await req.json();
    if (revision !== undefined && data !== undefined && !itemId) {
      if (revision < vault.revision) return json({ error: "conflict", serverRevision: vault.revision }, { status: 409 });
      const buffer = Buffer.from(data, "base64");
      await upload(vault.blobKey, buffer);
      const updated = await db.teamVault.update({ where: { id: vault.id }, data: { revision: vault.revision + 1, size: buffer.length } });
      return json({ success: true, revision: updated.revision });
    }
    if (!itemId) return json({ error: "itemId required" }, { status: 400 });
    const existing = await db.teamItem.findUnique({ where: { id: itemId } });
    if (!existing || existing.vaultId !== vault.id) return json({ error: "item not found" }, { status: 404 });
    if (data) {
      const validation = validateitemdata(existing.type as never, data);
      if (!validation.valid) return json({ error: validation.error }, { status: 400 });
    }
    const item = await db.teamItem.update({
      where: { id: itemId },
      data: { title, data: data ? (typeof data === "string" ? data : JSON.stringify(data)) : undefined, revision: existing.revision + 1 },
    });
    await db.teamVault.update({ where: { id: vault.id }, data: { revision: vault.revision + 1 } });
    await audit(id, session.user.id, "item.updated", { itemId });
    return json({ item });
  } catch {
    return json({ error: "failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return json({ error: "unauthorized" }, { status: 401 });
    const { id } = await params;
    const member = await getmember(id, session.user.id);
    if (!member || member.status !== "accepted") return json({ error: "team not found" }, { status: 404 });
    if (!canwrite(member.role as TeamRole)) return json({ error: "permission denied" }, { status: 403 });
    const vault = await getorvault(id);
    const url = new URL(req.url);
    const itemId = url.searchParams.get("itemId");
    if (!itemId) return json({ error: "itemId required" }, { status: 400 });
    const existing = await db.teamItem.findUnique({ where: { id: itemId } });
    if (!existing || existing.vaultId !== vault.id) return json({ error: "item not found" }, { status: 404 });
    await db.teamItem.delete({ where: { id: itemId } });
    await db.teamVault.update({ where: { id: vault.id }, data: { revision: vault.revision + 1 } });
    await audit(id, session.user.id, "item.deleted", { itemId, title: existing.title });
    return json({ success: true });
  } catch {
    return json({ error: "failed to delete item" }, { status: 500 });
  }
}
