import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateitemdata } from "@/lib/validate";
import type { ItemType } from "@/lib/generated/prisma/enums";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const item = await db.item.findUnique({
			where: { id },
			include: { tags: true, vault: true },
		});

		if (!item || item.vault.userId !== session.user.id) {
			return NextResponse.json({ error: "item not found" }, { status: 404 });
		}

		return NextResponse.json({ item });
	} catch {
		return NextResponse.json({ error: "failed to get item" }, { status: 500 });
	}
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const existing = await db.item.findUnique({
			where: { id },
			include: { vault: true },
		});

		if (!existing || existing.vault.userId !== session.user.id) {
			return NextResponse.json({ error: "item not found" }, { status: 404 });
		}

		const { title, data, tags, favorite } = await req.json();

		if (data) {
			const validation = validateitemdata(existing.type as ItemType, data);
			if (!validation.valid) {
				return NextResponse.json({ error: validation.error }, { status: 400 });
			}
		}

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
	} catch {
		return NextResponse.json({ error: "failed to update item" }, { status: 500 });
	}
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const existing = await db.item.findUnique({
			where: { id },
			include: { vault: true },
		});

		if (!existing || existing.vault.userId !== session.user.id) {
			return NextResponse.json({ error: "item not found" }, { status: 404 });
		}

		const body = await req.json();
		const updates: Record<string, unknown> = {};

		if (body.title !== undefined) updates.title = body.title;
		if (body.data !== undefined) {
			const validation = validateitemdata(existing.type as ItemType, body.data);
			if (!validation.valid) {
				return NextResponse.json({ error: validation.error }, { status: 400 });
			}
			updates.data = body.data;
		}
		if (body.favorite !== undefined) updates.favorite = body.favorite;
		if (body.deleted !== undefined) updates.deleted = body.deleted;
		if (body.folderId !== undefined) updates.folderId = body.folderId;

		if (body.tags !== undefined) {
			await db.tag.deleteMany({ where: { itemId: id } });
			updates.tags = { create: body.tags.map((name: string) => ({ name })) };
		}

		updates.revision = existing.revision + 1;

		const item = await db.item.update({
			where: { id },
			data: updates,
			include: { tags: true },
		});

		await db.vault.update({
			where: { id: existing.vaultId },
			data: { revision: existing.vault.revision + 1 },
		});

		return NextResponse.json({ item });
	} catch {
		return NextResponse.json({ error: "failed to update item" }, { status: 500 });
	}
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const existing = await db.item.findUnique({
			where: { id },
			include: { vault: true },
		});

		if (!existing || existing.vault.userId !== session.user.id) {
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
	} catch {
		return NextResponse.json({ error: "failed to delete item" }, { status: 500 });
	}
}
