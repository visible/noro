import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
	try {
		const session = await getSession();
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const vault = await db.vault.findUnique({
			where: { userId: session.userId },
		});

		if (!vault) {
			return NextResponse.json({ error: "vault not found" }, { status: 404 });
		}

		const url = new URL(req.url);
		const type = url.searchParams.get("type");
		const deleted = url.searchParams.get("deleted") === "true";

		const items = await db.item.findMany({
			where: {
				vaultId: vault.id,
				deleted,
				...(type ? { type: type as never } : {}),
			},
			include: { tags: true },
			orderBy: { updatedAt: "desc" },
		});

		return NextResponse.json({ items });
	} catch (error) {
		console.error("items get error:", error);
		return NextResponse.json({ error: "failed to get items" }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const session = await getSession();
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const vault = await db.vault.findUnique({
			where: { userId: session.userId },
		});

		if (!vault) {
			return NextResponse.json({ error: "vault not found" }, { status: 404 });
		}

		const { type, title, data, tags, favorite } = await req.json();

		if (!type || !title || !data) {
			return NextResponse.json({ error: "type, title, and data required" }, { status: 400 });
		}

		const item = await db.item.create({
			data: {
				vaultId: vault.id,
				type,
				title,
				data,
				favorite: favorite || false,
				tags: tags
					? {
							create: tags.map((name: string) => ({ name })),
						}
					: undefined,
			},
			include: { tags: true },
		});

		await db.vault.update({
			where: { id: vault.id },
			data: { revision: vault.revision + 1 },
		});

		return NextResponse.json({ item });
	} catch (error) {
		console.error("item create error:", error);
		return NextResponse.json({ error: "failed to create item" }, { status: 500 });
	}
}
