import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession, audit } from "@/lib/auth";

export async function POST(req: Request) {
	try {
		const { email, password, secretKey } = await req.json();

		if (!email || !password || !secretKey) {
			return NextResponse.json(
				{ error: "email, password, and secret key required" },
				{ status: 400 },
			);
		}

		const user = await db.user.findUnique({ where: { email } });
		if (!user) {
			return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
		}

		const combinedPassword = password + secretKey;
		const valid = await verifyPassword(combinedPassword, user.salt, user.keyHash);

		if (!valid) {
			const ip = req.headers.get("x-forwarded-for")?.split(",")[0];
			await audit(user.id, "login_failed", "invalid credentials", ip);
			return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
		}

		const ip = req.headers.get("x-forwarded-for")?.split(",")[0];
		const userAgent = req.headers.get("user-agent") || undefined;

		await createSession(user.id, ip, userAgent);
		await audit(user.id, "login_success", undefined, ip, userAgent);

		return NextResponse.json({
			success: true,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
		});
	} catch (error) {
		console.error("login error:", error);
		return NextResponse.json({ error: "login failed" }, { status: 500 });
	}
}
