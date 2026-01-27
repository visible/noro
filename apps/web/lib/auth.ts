import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");
const sessionDuration = 7 * 24 * 60 * 60 * 1000;

export interface SessionPayload {
	userId: string;
	sessionId: string;
}

export async function createSession(userId: string, ip?: string, userAgent?: string) {
	const expiresAt = new Date(Date.now() + sessionDuration);

	const session = await db.session.create({
		data: {
			userId,
			token: crypto.randomUUID(),
			expiresAt,
			ip,
			userAgent,
		},
	});

	const token = await new SignJWT({ userId, sessionId: session.id })
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime(expiresAt)
		.sign(secret);

	const jar = await cookies();
	jar.set("session", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt,
		path: "/",
	});

	return session;
}

export async function getSession(): Promise<SessionPayload | null> {
	const jar = await cookies();
	const token = jar.get("session")?.value;
	if (!token) return null;

	try {
		const { payload } = await jwtVerify(token, secret);
		const session = await db.session.findUnique({
			where: { id: payload.sessionId as string },
		});

		if (!session || session.expiresAt < new Date()) {
			return null;
		}

		return {
			userId: payload.userId as string,
			sessionId: payload.sessionId as string,
		};
	} catch {
		return null;
	}
}

export async function getUser() {
	const session = await getSession();
	if (!session) return null;

	return db.user.findUnique({
		where: { id: session.userId },
		select: {
			id: true,
			email: true,
			name: true,
			createdAt: true,
		},
	});
}

export async function deleteSession() {
	const session = await getSession();
	if (session) {
		await db.session.delete({ where: { id: session.sessionId } });
	}

	const jar = await cookies();
	jar.delete("session");
}

export async function audit(
	userId: string,
	action: string,
	details?: string,
	ip?: string,
	userAgent?: string,
) {
	await db.auditLog.create({
		data: { userId, action, details, ip, userAgent },
	});
}
