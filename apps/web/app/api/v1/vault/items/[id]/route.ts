import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await getSession();
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const item = await db.item.findUnique({
			where: { id },
			include: { tags: true, vault: true },
		});

		if (!item || item.vault.userId !== session.userId) {
			return NextResponse.json({ error: "item not found" }, { status: 404 });
		}

		return NextResponse.json({ item });
	} catch (error) {
		console.error("item get error:", error);
		return NextResponse.json({ error: "failed to get item" }, { status: 500 });
	}
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await getSession();
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const existing = await db.item.findUnique({
			where: { id },
			include: { vault: true },
		});

		if (!existing || existing.vault.userId !== session.userId) {
			return NextResponse.json({ error: "item not found" }, { status: 404 });
		}

		const { title, data, tags, favorite } = await req.json();

		if (tags) {
			await db.tag.deleteMany({ where: { itemId: id } });
		}

		const item = await db.item.update({
			where: { id },
			data: {
				title,
				data,
				favorite,
				revision: existing.revision + 1,
				tags: tags
					? {
							create: tags.map((name: string) => ({ name })),
						}
					: undefined,
			},
			include: { tags: true },
		});

		await db.vault.update({
			where: { id: existing.vaultId },
			data: { revision: existing.vault.revision + 1 },
		});

		return NextResponse.json({ item });
	} catch (error) {
		console.error("item update error:", error);
		return NextResponse.json({ error: "failed to update item" }, { status: 500 });
	}
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await getSession();
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const existing = await db.item.findUnique({
			where: { id },
			include: { vault: true },
		});

		if (!existing || existing.vault.userId !== session.userId) {
			return NextResponse.json({ error: "item not found" }, { status: 404 });
		}

		await db.item.update({
			where: { id },
			data: { deleted: true },
		});

		await db.vault.update({
			where: { id: existing.vaultId },
			data: { revision: existing.vault.revision + 1 },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("item delete error:", error);
		return NextResponse.json({ error: "failed to delete item" }, { status: 500 });
	}
}
