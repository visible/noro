import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	return NextResponse.json({
		user: {
			id: session.user.id,
			email: session.user.email,
			name: session.user.name,
			image: session.user.image
		}
	});
}
