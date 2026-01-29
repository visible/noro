import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { CreateContactPayload, EmergencyAccess } from "../types";

type AccessWithGrantee = EmergencyAccess & { grantee: { email: string; name: string } };

const MIN_WAIT_DAYS = 1;
const MAX_WAIT_DAYS = 30;
const DEFAULT_WAIT_DAYS = 7;

export async function POST(req: Request) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const body: CreateContactPayload = await req.json();
		const { email, waitDays = DEFAULT_WAIT_DAYS } = body;

		if (!email || typeof email !== "string") {
			return NextResponse.json({ error: "email required" }, { status: 400 });
		}

		const normalizedEmail = email.toLowerCase().trim();

		if (normalizedEmail === session.user.email?.toLowerCase()) {
			return NextResponse.json({ error: "cannot add yourself as contact" }, { status: 400 });
		}

		if (waitDays < MIN_WAIT_DAYS || waitDays > MAX_WAIT_DAYS) {
			return NextResponse.json(
				{ error: `waitDays must be between ${MIN_WAIT_DAYS} and ${MAX_WAIT_DAYS}` },
				{ status: 400 },
			);
		}

		const grantee = await db.user.findUnique({
			where: { email: normalizedEmail },
			select: { id: true, email: true, name: true },
		});

		if (!grantee) {
			return NextResponse.json({ error: "user not found" }, { status: 404 });
		}

		const existing = await db.emergencyAccess.findUnique({
			where: {
				grantorId_granteeId: {
					grantorId: session.user.id,
					granteeId: grantee.id,
				},
			},
		});

		if (existing) {
			return NextResponse.json({ error: "contact already exists" }, { status: 409 });
		}

		const access = await db.emergencyAccess.create({
			data: {
				grantorId: session.user.id,
				granteeId: grantee.id,
				waitDays: Math.floor(waitDays),
			},
			include: {
				grantee: { select: { email: true, name: true } },
			},
		});

		return NextResponse.json({
			id: access.id,
			email: access.grantee.email,
			name: access.grantee.name,
			status: access.status,
			waitDays: access.waitDays,
			createdAt: access.createdAt,
		});
	} catch {
		return NextResponse.json({ error: "failed to add contact" }, { status: 500 });
	}
}

export async function GET() {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const contacts = await db.emergencyAccess.findMany({
			where: { grantorId: session.user.id },
			include: {
				grantee: { select: { email: true, name: true } },
			},
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json({
			contacts: (contacts as AccessWithGrantee[]).map((c) => ({
				id: c.id,
				email: c.grantee.email,
				name: c.grantee.name,
				status: c.status,
				waitDays: c.waitDays,
				requestedAt: c.requestedAt,
				expiresAt: c.expiresAt,
				createdAt: c.createdAt,
			})),
		});
	} catch {
		return NextResponse.json({ error: "failed to list contacts" }, { status: 500 });
	}
}

export async function PATCH(req: Request) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const { id, waitDays } = body;

		if (!id || typeof id !== "string") {
			return NextResponse.json({ error: "id required" }, { status: 400 });
		}

		if (waitDays !== undefined) {
			if (typeof waitDays !== "number" || waitDays < MIN_WAIT_DAYS || waitDays > MAX_WAIT_DAYS) {
				return NextResponse.json(
					{ error: `waitDays must be between ${MIN_WAIT_DAYS} and ${MAX_WAIT_DAYS}` },
					{ status: 400 },
				);
			}
		}

		const access = await db.emergencyAccess.findUnique({
			where: { id },
		});

		if (!access) {
			return NextResponse.json({ error: "not found" }, { status: 404 });
		}

		if (access.grantorId !== session.user.id) {
			return NextResponse.json({ error: "forbidden" }, { status: 403 });
		}

		if (access.status !== "pending") {
			return NextResponse.json({ error: "cannot modify active request" }, { status: 400 });
		}

		const updated = await db.emergencyAccess.update({
			where: { id },
			data: {
				waitDays: waitDays !== undefined ? Math.floor(waitDays) : undefined,
			},
			include: {
				grantee: { select: { email: true, name: true } },
			},
		});

		return NextResponse.json({
			id: updated.id,
			email: updated.grantee.email,
			name: updated.grantee.name,
			status: updated.status,
			waitDays: updated.waitDays,
			createdAt: updated.createdAt,
		});
	} catch {
		return NextResponse.json({ error: "failed to update contact" }, { status: 500 });
	}
}
