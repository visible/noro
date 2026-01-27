import { NextResponse } from "next/server";
import { deleteSession, getSession, audit } from "@/lib/auth";

export async function POST(req: Request) {
	try {
		const session = await getSession();
		if (session) {
			const ip = req.headers.get("x-forwarded-for")?.split(",")[0];
			await audit(session.userId, "logout", undefined, ip);
		}

		await deleteSession();

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("logout error:", error);
		return NextResponse.json({ error: "logout failed" }, { status: 500 });
	}
}
