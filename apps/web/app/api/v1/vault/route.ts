import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { download, upload, vaultkey, createemptyvault } from "@/lib/r2";

async function createvault(userId: string) {
	const blobKey = vaultkey(userId);
	const emptyVault = await createemptyvault(blobKey);
	return db.vault.create({
		data: {
			userId,
			blobKey,
			revision: 1,
			size: emptyVault.length,
		},
	});
}

export async function GET() {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		let vault = await db.vault.findUnique({
			where: { userId: session.user.id },
		});

		if (!vault) {
			vault = await createvault(session.user.id);
		}

		const data = await download(vault.blobKey);
		if (!data) {
			return NextResponse.json({ error: "vault data not found" }, { status: 404 });
		}

		return NextResponse.json({
			data: data.toString("base64"),
			revision: vault.revision,
		});
	} catch {
		return NextResponse.json({ error: "failed to get vault" }, { status: 500 });
	}
}

export async function PUT(req: Request) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const { data, revision } = await req.json();
		if (!data) {
			return NextResponse.json({ error: "data required" }, { status: 400 });
		}

		let vault = await db.vault.findUnique({
			where: { userId: session.user.id },
		});

		if (!vault) {
			vault = await createvault(session.user.id);
		}

		if (revision !== undefined && revision < vault.revision) {
			return NextResponse.json(
				{ error: "conflict", serverRevision: vault.revision },
				{ status: 409 },
			);
		}

		const buffer = Buffer.from(data, "base64");
		await upload(vault.blobKey, buffer);

		const updated = await db.vault.update({
			where: { id: vault.id },
			data: {
				revision: vault.revision + 1,
				size: buffer.length,
			},
		});

		return NextResponse.json({
			success: true,
			revision: updated.revision,
		});
	} catch {
		return NextResponse.json({ error: "failed to update vault" }, { status: 500 });
	}
}
