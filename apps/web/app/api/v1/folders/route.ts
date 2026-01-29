import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { FolderIcon } from "@/lib/types";
import type { FolderColor } from "@/lib/folders";

interface CreateBody {
	name: string;
	parentId?: string | null;
	color?: FolderColor;
	icon?: FolderIcon;
}

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	try {
		const folders = await db.folder.findMany({
			where: { userId: session.user.id },
			orderBy: [{ order: "asc" }, { createdAt: "asc" }],
		});

		const counts = await db.item.groupBy({
			by: ["folderId"],
			where: {
				vault: { userId: session.user.id },
				deleted: false,
				folderId: { not: null },
			},
			_count: { id: true },
		});

		const countMap: Record<string, number> = {};
		counts.forEach((c) => {
			if (c.folderId) countMap[c.folderId] = c._count.id;
		});

		const tree = buildTree(folders, countMap);

		return NextResponse.json({ folders, tree, counts: countMap });
	} catch {
		return NextResponse.json({ error: "failed to fetch folders" }, { status: 500 });
	}
}

export async function POST(req: Request) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	try {
		const body: CreateBody = await req.json();
		const { name, parentId, color = "default", icon = "folder" } = body;

		if (!name || typeof name !== "string" || name.trim().length === 0) {
			return NextResponse.json({ error: "name required" }, { status: 400 });
		}

		if (parentId) {
			const parent = await db.folder.findFirst({
				where: { id: parentId, userId: session.user.id },
			});
			if (!parent) {
				return NextResponse.json({ error: "parent folder not found" }, { status: 404 });
			}
		}

		const siblings = await db.folder.findMany({
			where: { userId: session.user.id, parentId: parentId || null },
			orderBy: { order: "desc" },
			take: 1,
		});

		const maxOrder = siblings[0]?.order ?? -1;

		const folder = await db.folder.create({
			data: {
				name: name.trim(),
				parentId: parentId || null,
				userId: session.user.id,
				color,
				icon,
				order: maxOrder + 1,
			},
		});

		return NextResponse.json({ folder }, { status: 201 });
	} catch {
		return NextResponse.json({ error: "failed to create folder" }, { status: 500 });
	}
}

interface FolderNode {
	id: string;
	name: string;
	parentId: string | null;
	color: string;
	icon: string;
	order: number;
	children: FolderNode[];
	itemCount: number;
}

function buildTree(
	folders: { id: string; name: string; parentId: string | null; color: string; icon: string; order: number }[],
	counts: Record<string, number>
): FolderNode[] {
	const map = new Map<string | null, FolderNode[]>();

	folders.forEach((folder) => {
		const node: FolderNode = {
			...folder,
			children: [],
			itemCount: counts[folder.id] || 0,
		};
		const pid = folder.parentId;
		if (!map.has(pid)) map.set(pid, []);
		map.get(pid)!.push(node);
	});

	function attach(parent: FolderNode) {
		const children = map.get(parent.id) || [];
		children.sort((a, b) => a.order - b.order);
		parent.children = children;
		children.forEach(attach);
	}

	const roots = map.get(null) || [];
	roots.sort((a, b) => a.order - b.order);
	roots.forEach(attach);

	return roots;
}
