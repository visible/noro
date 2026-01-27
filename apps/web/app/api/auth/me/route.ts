import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function GET() {
	try {
		const user = await getUser();

		if (!user) {
			return NextResponse.json({ error: "not authenticated" }, { status: 401 });
		}

		return NextResponse.json({ user });
	} catch (error) {
		console.error("me error:", error);
		return NextResponse.json({ error: "failed to get user" }, { status: 500 });
	}
}
