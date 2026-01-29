import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { RespondPayload, KeyPair } from "../types";

async function generatekeypair(): Promise<KeyPair> {
	const { generateKeyPairSync } = await import("crypto");
	const { publicKey, privateKey } = generateKeyPairSync("rsa", {
		modulusLength: 4096,
		publicKeyEncoding: { type: "spki", format: "pem" },
		privateKeyEncoding: { type: "pkcs8", format: "pem" },
	});
	return {
		publicKey: Buffer.from(publicKey).toString("base64"),
		privateKey: Buffer.from(privateKey).toString("base64"),
	};
}

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const access = await db.emergencyAccess.findUnique({
			where: { id },
			include: {
				grantor: { select: { email: true, name: true } },
				grantee: { select: { email: true, name: true } },
			},
		});

		if (!access) {
			return NextResponse.json({ error: "not found" }, { status: 404 });
		}

		if (access.grantorId !== session.user.id && access.granteeId !== session.user.id) {
			return NextResponse.json({ error: "forbidden" }, { status: 403 });
		}

		const isGrantor = access.grantorId === session.user.id;
		const now = new Date();
		const autoApproved = access.status === "requested" && access.expiresAt && access.expiresAt <= now;

		const response: Record<string, unknown> = {
			id: access.id,
			status: autoApproved ? "approved" : access.status,
			waitDays: access.waitDays,
			requestedAt: access.requestedAt,
			approvedAt: access.approvedAt,
			deniedAt: access.deniedAt,
			expiresAt: access.expiresAt,
			createdAt: access.createdAt,
		};

		if (isGrantor) {
			response.grantee = { email: access.grantee.email, name: access.grantee.name };
		} else {
			response.grantor = { email: access.grantor.email, name: access.grantor.name };
			if (autoApproved || access.status === "approved") {
				response.encryptedVaultKey = access.encryptedVaultKey;
				response.grantorPublicKey = access.grantorPublicKey;
			}
		}

		return NextResponse.json(response);
	} catch {
		return NextResponse.json({ error: "failed to get access" }, { status: 500 });
	}
}

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const body: RespondPayload = await req.json();
		const { action, encryptedVaultKey } = body;

		if (!action || (action !== "approve" && action !== "deny")) {
			return NextResponse.json({ error: "invalid action" }, { status: 400 });
		}

		const access = await db.emergencyAccess.findUnique({
			where: { id },
		});

		if (!access) {
			return NextResponse.json({ error: "not found" }, { status: 404 });
		}

		if (access.grantorId !== session.user.id) {
			return NextResponse.json({ error: "only grantor can respond" }, { status: 403 });
		}

		if (access.status !== "requested") {
			return NextResponse.json({ error: `cannot respond to ${access.status} request` }, { status: 400 });
		}

		const now = new Date();

		if (action === "deny") {
			const updated = await db.emergencyAccess.update({
				where: { id },
				data: {
					status: "denied",
					deniedAt: now,
				},
			});
			return NextResponse.json({
				id: updated.id,
				status: updated.status,
				deniedAt: updated.deniedAt,
			});
		}

		if (!encryptedVaultKey) {
			return NextResponse.json({ error: "encryptedVaultKey required for approval" }, { status: 400 });
		}

		const keypair = await generatekeypair();

		const updated = await db.emergencyAccess.update({
			where: { id },
			data: {
				status: "approved",
				approvedAt: now,
				grantorPublicKey: keypair.publicKey,
				grantorPrivateKey: keypair.privateKey,
				encryptedVaultKey,
			},
		});

		return NextResponse.json({
			id: updated.id,
			status: updated.status,
			approvedAt: updated.approvedAt,
			publicKey: keypair.publicKey,
		});
	} catch {
		return NextResponse.json({ error: "failed to respond" }, { status: 500 });
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const access = await db.emergencyAccess.findUnique({
			where: { id },
		});

		if (!access) {
			return NextResponse.json({ error: "not found" }, { status: 404 });
		}

		if (access.grantorId !== session.user.id && access.granteeId !== session.user.id) {
			return NextResponse.json({ error: "forbidden" }, { status: 403 });
		}

		await db.emergencyAccess.delete({ where: { id } });

		return NextResponse.json({ deleted: true });
	} catch {
		return NextResponse.json({ error: "failed to delete" }, { status: 500 });
	}
}
