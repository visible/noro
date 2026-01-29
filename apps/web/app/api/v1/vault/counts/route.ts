import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	}

	const vault = await db.vault.findUnique({
		where: { userId: session.user.id },
		include: {
			items: {
				select: {
					favorite: true,
					deleted: true
				}
			}
		}
	});

	if (!vault) {
		return NextResponse.json({
			byFolder: {},
			favorites: 0,
			trash: 0,
			total: 0
		});
	}

	const items = vault.items || [];
	const favorites = items.filter(i => i.favorite && !i.deleted).length;
	const trash = items.filter(i => i.deleted).length;
	const total = items.filter(i => !i.deleted).length;

	return NextResponse.json({
		byFolder: {},
		favorites,
		trash,
		total
	});
}
