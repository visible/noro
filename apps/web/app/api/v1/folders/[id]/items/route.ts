import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface MoveBody {
	itemIds: string[];
}

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	try {
		const body: MoveBody = await req.json();
		const { itemIds } = body;

		if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
			return NextResponse.json({ error: "itemIds required" }, { status: 400 });
		}

		const targetFolderId = id === "all" || id === "null" ? null : id;

		if (targetFolderId) {
			const folder = await db.folder.findFirst({
				where: { id: targetFolderId, userId: session.user.id },
			});

			if (!folder) {
				return NextResponse.json({ error: "folder not found" }, { status: 404 });
			}
		}

		const result = await db.item.updateMany({
			where: {
				id: { in: itemIds },
				vault: { userId: session.user.id },
			},
			data: { folderId: targetFolderId },
		});

		return NextResponse.json({ moved: result.count, folderId: targetFolderId });
	} catch {
		return NextResponse.json({ error: "failed to move items" }, { status: 500 });
	}
}

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const { id } = await params;

	try {
		const folder = await db.folder.findFirst({
			where: { id, userId: session.user.id },
		});

		if (!folder) {
			return NextResponse.json({ error: "folder not found" }, { status: 404 });
		}

		const items = await db.item.findMany({
			where: {
				folderId: id,
				vault: { userId: session.user.id },
				deleted: false,
			},
			orderBy: { updatedAt: "desc" },
		});

		return NextResponse.json({ items, count: items.length });
	} catch {
		return NextResponse.json({ error: "failed to fetch items" }, { status: 500 });
	}
}
