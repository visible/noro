import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { caninvite, canmanage, isvalidrole, isvalidemail, type TeamRole } from "@/lib/teams";

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
    const members = await db.teamMember.findMany({
      where: { teamId: id },
      select: { id: true, email: true, role: true, status: true, invitedAt: true, joinedAt: true, user: { select: { name: true, image: true } } },
      orderBy: { invitedAt: "asc" },
    });
    return json({ members });
  } catch {
    return json({ error: "failed to list members" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return json({ error: "unauthorized" }, { status: 401 });
    const { id } = await params;
    const member = await getmember(id, session.user.id);
    if (!member || member.status !== "accepted") return json({ error: "team not found" }, { status: 404 });
    if (!caninvite(member.role as TeamRole)) return json({ error: "permission denied" }, { status: 403 });
    const { email, role } = await req.json();
    if (!email || !isvalidemail(email)) return json({ error: "valid email required" }, { status: 400 });
    if (!role || !isvalidrole(role)) return json({ error: "valid role required" }, { status: 400 });
    if (role === "owner") return json({ error: "cannot invite as owner" }, { status: 400 });
    const existing = await db.teamMember.findFirst({ where: { teamId: id, email: email.toLowerCase() } });
    if (existing) return json({ error: "member already exists" }, { status: 409 });
    const invitedUser = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    const invite = await db.teamMember.create({
      data: { teamId: id, userId: invitedUser?.id || session.user.id, email: email.toLowerCase(), role, status: "pending" },
    });
    await audit(id, session.user.id, "member.invited", { email, role });
    return json({ member: { id: invite.id, email: invite.email, role: invite.role, status: invite.status } });
  } catch {
    return json({ error: "failed to invite member" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return json({ error: "unauthorized" }, { status: 401 });
    const { id } = await params;
    const { memberId, role, action } = await req.json();
    if (action === "accept" || action === "decline") {
      const invite = await db.teamMember.findFirst({ where: { teamId: id, email: session.user.email, status: "pending" } });
      if (!invite) return json({ error: "invite not found" }, { status: 404 });
      if (action === "decline") {
        await db.teamMember.delete({ where: { id: invite.id } });
        return json({ success: true });
      }
      await db.teamMember.update({ where: { id: invite.id }, data: { userId: session.user.id, status: "accepted", joinedAt: new Date() } });
      await audit(id, session.user.id, "member.joined");
      return json({ success: true });
    }
    if (memberId && role) {
      const member = await getmember(id, session.user.id);
      if (!member || member.status !== "accepted") return json({ error: "team not found" }, { status: 404 });
      if (!canmanage(member.role as TeamRole)) return json({ error: "permission denied" }, { status: 403 });
      if (!isvalidrole(role)) return json({ error: "invalid role" }, { status: 400 });
      if (role === "owner") return json({ error: "use transfer to change owner" }, { status: 400 });
      const target = await db.teamMember.findUnique({ where: { id: memberId } });
      if (!target || target.teamId !== id) return json({ error: "member not found" }, { status: 404 });
      if (target.role === "owner") return json({ error: "cannot change owner role" }, { status: 403 });
      await db.teamMember.update({ where: { id: memberId }, data: { role } });
      await audit(id, session.user.id, "member.updated", { memberId, role });
      return json({ success: true });
    }
    return json({ error: "invalid request" }, { status: 400 });
  } catch {
    return json({ error: "failed to update member" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return json({ error: "unauthorized" }, { status: 401 });
    const { id } = await params;
    const url = new URL(req.url);
    const memberId = url.searchParams.get("memberId");
    const member = await getmember(id, session.user.id);
    if (!member || member.status !== "accepted") return json({ error: "team not found" }, { status: 404 });
    if (memberId) {
      if (!canmanage(member.role as TeamRole)) return json({ error: "permission denied" }, { status: 403 });
      const target = await db.teamMember.findUnique({ where: { id: memberId } });
      if (!target || target.teamId !== id) return json({ error: "member not found" }, { status: 404 });
      if (target.role === "owner") return json({ error: "cannot remove owner" }, { status: 403 });
      await db.teamMember.delete({ where: { id: memberId } });
      await audit(id, session.user.id, "member.removed", { memberId, email: target.email });
      return json({ success: true });
    }
    if (member.role === "owner") return json({ error: "owner cannot leave" }, { status: 403 });
    await db.teamMember.delete({ where: { id: member.id } });
    await audit(id, session.user.id, "member.left");
    return json({ success: true });
  } catch {
    return json({ error: "failed to remove member" }, { status: 500 });
  }
}
