import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { remove } from "@/lib/r2";
import { canmanage, candelete, cantransfer, type TeamRole } from "@/lib/teams";

const json = NextResponse.json;

async function getmember(teamId: string, userId: string) {
  return db.teamMember.findUnique({ where: { teamId_userId: { teamId, userId } } });
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
    const team = await db.team.findUnique({
      where: { id },
      include: {
        members: { where: { status: "accepted" }, select: { id: true, email: true, role: true, joinedAt: true } },
        vault: { select: { revision: true, size: true } },
      },
    });
    if (!team) return json({ error: "team not found" }, { status: 404 });
    return json({ team: { id: team.id, name: team.name, role: member.role, members: team.members, vault: team.vault, createdAt: team.createdAt } });
  } catch (e) {
    console.error("team get error:", e);
    return json({ error: "failed to get team" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return json({ error: "unauthorized" }, { status: 401 });
    const { id } = await params;
    const member = await getmember(id, session.user.id);
    if (!member || member.status !== "accepted") return json({ error: "team not found" }, { status: 404 });
    if (!canmanage(member.role as TeamRole)) return json({ error: "permission denied" }, { status: 403 });
    const { name, transferTo } = await req.json();
    if (transferTo) {
      if (!cantransfer(member.role as TeamRole)) return json({ error: "only owner can transfer" }, { status: 403 });
      const newOwner = await db.teamMember.findFirst({ where: { teamId: id, userId: transferTo, status: "accepted" } });
      if (!newOwner) return json({ error: "member not found" }, { status: 404 });
      await db.$transaction([
        db.teamMember.update({ where: { id: member.id }, data: { role: "admin" } }),
        db.teamMember.update({ where: { id: newOwner.id }, data: { role: "owner" } }),
      ]);
      await audit(id, session.user.id, "team.transferred", { newOwnerId: transferTo });
      return json({ success: true });
    }
    if (name) {
      if (typeof name !== "string" || name.trim().length === 0) return json({ error: "invalid name" }, { status: 400 });
      if (name.length > 100) return json({ error: "name too long" }, { status: 400 });
      const updated = await db.team.update({ where: { id }, data: { name: name.trim() } });
      await audit(id, session.user.id, "team.updated", { name: name.trim() });
      return json({ team: { id: updated.id, name: updated.name } });
    }
    return json({ error: "nothing to update" }, { status: 400 });
  } catch (e) {
    console.error("team update error:", e);
    return json({ error: "failed to update team" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return json({ error: "unauthorized" }, { status: 401 });
    const { id } = await params;
    const member = await getmember(id, session.user.id);
    if (!member || member.status !== "accepted") return json({ error: "team not found" }, { status: 404 });
    if (!candelete(member.role as TeamRole)) return json({ error: "only owner can delete" }, { status: 403 });
    const vault = await db.teamVault.findUnique({ where: { teamId: id } });
    if (vault) await remove(vault.blobKey);
    await db.team.delete({ where: { id } });
    return json({ success: true });
  } catch (e) {
    console.error("team delete error:", e);
    return json({ error: "failed to delete team" }, { status: 500 });
  }
}
