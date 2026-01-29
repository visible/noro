import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { FolderIcon } from "@/lib/types";
import type { FolderColor } from "@/lib/folders";

interface UpdateBody {
	name?: string;
	parentId?: string | null;
	color?: FolderColor;
	icon?: FolderIcon;
	order?: number;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { id } = await params;

	try {
		const folder = await db.folder.findFirst({ where: { id, userId: session.user.id } });
		if (!folder) return NextResponse.json({ error: "folder not found" }, { status: 404 });

		const itemCount = await db.item.count({
			where: { folderId: id, vault: { userId: session.user.id }, deleted: false },
		});

		return NextResponse.json({ folder, itemCount });
	} catch {
		return NextResponse.json({ error: "failed to fetch folder" }, { status: 500 });
	}
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { id } = await params;

	try {
		const folder = await db.folder.findFirst({ where: { id, userId: session.user.id } });
		if (!folder) return NextResponse.json({ error: "folder not found" }, { status: 404 });

		const body: UpdateBody = await req.json();
		const { name, parentId, color, icon, order } = body;

		if (parentId !== undefined && parentId === id) {
			return NextResponse.json({ error: "cannot set folder as its own parent" }, { status: 400 });
		}

		if (parentId !== undefined && parentId !== null) {
			if (await checkCycle(id, parentId, session.user.id)) {
				return NextResponse.json({ error: "circular reference detected" }, { status: 400 });
			}
			const parent = await db.folder.findFirst({ where: { id: parentId, userId: session.user.id } });
			if (!parent) return NextResponse.json({ error: "parent folder not found" }, { status: 404 });
		}

		const updates: Record<string, unknown> = {};
		if (name !== undefined) updates.name = name.trim();
		if (parentId !== undefined) updates.parentId = parentId;
		if (color !== undefined) updates.color = color;
		if (icon !== undefined) updates.icon = icon;
		if (order !== undefined) updates.order = order;

		const updated = await db.folder.update({ where: { id }, data: updates });
		return NextResponse.json({ folder: updated });
	} catch {
		return NextResponse.json({ error: "failed to update folder" }, { status: 500 });
	}
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const { id } = await params;

	try {
		const folder = await db.folder.findFirst({ where: { id, userId: session.user.id } });
		if (!folder) return NextResponse.json({ error: "folder not found" }, { status: 404 });

		const descendants = await collectDescendants(id, session.user.id);
		const toDelete = [id, ...descendants];

		await db.item.updateMany({
			where: { folderId: { in: toDelete }, vault: { userId: session.user.id } },
			data: { folderId: folder.parentId },
		});

		await db.folder.deleteMany({ where: { id: { in: toDelete }, userId: session.user.id } });
		return NextResponse.json({ deleted: toDelete, movedItemsTo: folder.parentId });
	} catch {
		return NextResponse.json({ error: "failed to delete folder" }, { status: 500 });
	}
}

async function checkCycle(folderId: string, newParentId: string, userId: string): Promise<boolean> {
	let currentId: string | null = newParentId;
	const visited = new Set<string>();

	while (currentId) {
		if (currentId === folderId || visited.has(currentId)) return true;
		visited.add(currentId);
		const result: { parentId: string | null } | null = await db.folder.findFirst({ where: { id: currentId, userId }, select: { parentId: true } });
		currentId = result?.parentId ?? null;
	}

	return false;
}

async function collectDescendants(parentId: string, userId: string): Promise<string[]> {
	const children = await db.folder.findMany({ where: { parentId, userId }, select: { id: true } });
	const ids: string[] = [];

	for (const child of children) {
		ids.push(child.id);
		ids.push(...(await collectDescendants(child.id, userId)));
	}

	return ids;
}
