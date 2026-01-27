import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { download, upload, vaultkey } from "@/lib/r2";

export async function GET() {
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

		const data = await download(vault.blobKey);
		if (!data) {
			return NextResponse.json({ error: "vault data not found" }, { status: 404 });
		}

		return NextResponse.json({
			data: data.toString("base64"),
			revision: vault.revision,
		});
	} catch (error) {
		console.error("vault get error:", error);
		return NextResponse.json({ error: "failed to get vault" }, { status: 500 });
	}
}

export async function PUT(req: Request) {
	try {
		const session = await getSession();
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const { data, revision } = await req.json();
		if (!data) {
			return NextResponse.json({ error: "data required" }, { status: 400 });
		}

		const vault = await db.vault.findUnique({
			where: { userId: session.userId },
		});

		if (!vault) {
			return NextResponse.json({ error: "vault not found" }, { status: 404 });
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
	} catch (error) {
		console.error("vault put error:", error);
		return NextResponse.json({ error: "failed to update vault" }, { status: 500 });
	}
}
