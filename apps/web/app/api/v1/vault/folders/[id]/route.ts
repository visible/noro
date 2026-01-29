import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const { id } = await params;
	const { name } = await req.json();

	return NextResponse.json({
		folder: { id, name }
	});
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	return NextResponse.json({ deleted: true, id });
}
