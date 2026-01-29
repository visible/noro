import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const { encryptedKey, keyHash, salt } = await request.json();

		if (!encryptedKey || !keyHash || !salt) {
			return NextResponse.json({ error: "missing fields" }, { status: 400 });
		}

		await db.user.update({
			where: { id: session.user.id },
			data: { encryptedKey, keyHash, salt },
		});

		return NextResponse.json({ success: true });
	} catch {
		return NextResponse.json({ error: "setup failed" }, { status: 500 });
	}
}
