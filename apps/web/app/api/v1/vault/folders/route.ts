import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	return NextResponse.json({ folders: [] });
}

export async function POST(req: Request) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const { name } = await req.json();

	return NextResponse.json({
		folder: {
			id: crypto.randomUUID(),
			name,
			parentId: null,
			icon: "folder"
		}
	});
}
