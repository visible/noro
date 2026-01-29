import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { RequestAccessPayload, EmergencyAccess } from "./types";

type AccessWithGrantee = EmergencyAccess & { grantee: { email: string; name: string } };
type AccessWithGrantor = EmergencyAccess & { grantor: { email: string; name: string } };

export async function POST(req: Request) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const body: RequestAccessPayload = await req.json();
		const { grantorId } = body;

		if (!grantorId || typeof grantorId !== "string") {
			return NextResponse.json({ error: "grantorId required" }, { status: 400 });
		}

		if (grantorId === session.user.id) {
			return NextResponse.json({ error: "cannot request access to own vault" }, { status: 400 });
		}

		const access = await db.emergencyAccess.findUnique({
			where: {
				grantorId_granteeId: {
					grantorId,
					granteeId: session.user.id,
				},
			},
		});

		if (!access) {
			return NextResponse.json({ error: "not a trusted contact" }, { status: 403 });
		}

		if (access.status !== "pending") {
			return NextResponse.json({ error: `access already ${access.status}` }, { status: 400 });
		}

		const now = new Date();
		const expiresAt = new Date(now.getTime() + access.waitDays * 24 * 60 * 60 * 1000);

		const updated = await db.emergencyAccess.update({
			where: { id: access.id },
			data: {
				status: "requested",
				requestedAt: now,
				expiresAt,
			},
			include: {
				grantor: { select: { email: true, name: true } },
			},
		});

		return NextResponse.json({
			id: updated.id,
			status: updated.status,
			waitDays: updated.waitDays,
			requestedAt: updated.requestedAt,
			expiresAt: updated.expiresAt,
			grantor: {
				email: updated.grantor.email,
				name: updated.grantor.name,
			},
		});
	} catch (error) {
		console.error("emergency request error:", error);
		return NextResponse.json({ error: "failed to request access" }, { status: 500 });
	}
}

export async function GET() {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const [asGrantor, asGrantee] = await Promise.all([
			db.emergencyAccess.findMany({
				where: { grantorId: session.user.id },
				include: {
					grantee: { select: { email: true, name: true } },
				},
				orderBy: { createdAt: "desc" },
			}),
			db.emergencyAccess.findMany({
				where: { granteeId: session.user.id },
				include: {
					grantor: { select: { email: true, name: true } },
				},
				orderBy: { createdAt: "desc" },
			}),
		]);

		const now = new Date();

		const contacts = (asGrantor as AccessWithGrantee[]).map((a) => ({
			id: a.id,
			email: a.grantee.email,
			name: a.grantee.name,
			status: a.status,
			waitDays: a.waitDays,
			requestedAt: a.requestedAt,
			expiresAt: a.expiresAt,
			isExpired: a.expiresAt && a.status === "requested" && a.expiresAt <= now,
		}));

		const requests = (asGrantee as AccessWithGrantor[]).map((a) => ({
			id: a.id,
			grantorEmail: a.grantor.email,
			grantorName: a.grantor.name,
			status: a.status,
			waitDays: a.waitDays,
			requestedAt: a.requestedAt,
			expiresAt: a.expiresAt,
			canAccess: a.status === "approved" || (a.status === "requested" && a.expiresAt && a.expiresAt <= now),
		}));

		return NextResponse.json({ contacts, requests });
	} catch (error) {
		console.error("emergency list error:", error);
		return NextResponse.json({ error: "failed to list access" }, { status: 500 });
	}
}
