import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { vaultkey, createemptyvault } from "@/lib/r2";
import { validateitemdata, isvaliditemtype } from "@/lib/validate";

async function getorvault(userId: string) {
	let vault = await db.vault.findUnique({
		where: { userId },
	});
	if (!vault) {
		const blobKey = vaultkey(userId);
		const emptyVault = await createemptyvault(blobKey);
		vault = await db.vault.create({
			data: {
				userId,
				blobKey,
				revision: 1,
				size: emptyVault.length,
			},
		});
	}
	return vault;
}

export async function GET(req: Request) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const vault = await getorvault(session.user.id);

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
	} catch {
		return NextResponse.json({ error: "failed to get items" }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const vault = await getorvault(session.user.id);

		const { type, title, data, tags, favorite } = await req.json();

		if (!type || !title || !data) {
			return NextResponse.json({ error: "type, title, and data required" }, { status: 400 });
		}

		if (!isvaliditemtype(type)) {
			return NextResponse.json({ error: "invalid item type" }, { status: 400 });
		}

		const validation = validateitemdata(type, data);
		if (!validation.valid) {
			return NextResponse.json({ error: validation.error }, { status: 400 });
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
	} catch {
		return NextResponse.json({ error: "failed to create item" }, { status: 500 });
	}
}
