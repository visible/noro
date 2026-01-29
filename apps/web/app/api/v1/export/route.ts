import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { createexport } from "@/lib/export";
import { getip } from "@/lib/ratelimit";

const exportlimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(1, "1 h"),
	prefix: "ratelimit:export",
});

type ExportFormat = "noro" | "bitwarden" | "csv";

function isvalidformat(format: unknown): format is ExportFormat {
	return format === "noro" || format === "bitwarden" || format === "csv";
}

export async function POST(req: Request) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		const ip = getip(req);
		const { success, remaining, reset } = await exportlimit.limit(session.user.id);

		if (!success) {
			return NextResponse.json(
				{
					error: "rate limit exceeded",
					remaining: 0,
					reset: Math.ceil((reset - Date.now()) / 1000),
				},
				{
					status: 429,
					headers: {
						"x-ratelimit-limit": "1",
						"x-ratelimit-remaining": "0",
						"x-ratelimit-reset": String(reset),
						"retry-after": String(Math.ceil((reset - Date.now()) / 1000)),
					},
				},
			);
		}

		const body = await req.json();
		const { format, encrypted, password } = body;

		if (!isvalidformat(format)) {
			return NextResponse.json(
				{ error: "invalid format, must be: noro, bitwarden, or csv" },
				{ status: 400 },
			);
		}

		if (encrypted && !password) {
			return NextResponse.json(
				{ error: "password required for encrypted export" },
				{ status: 400 },
			);
		}

		if (encrypted && typeof password === "string" && password.length < 8) {
			return NextResponse.json(
				{ error: "password must be at least 8 characters" },
				{ status: 400 },
			);
		}

		const vault = await db.vault.findUnique({
			where: { userId: session.user.id },
		});

		if (!vault) {
			return NextResponse.json({ error: "vault not found" }, { status: 404 });
		}

		const items = await db.item.findMany({
			where: { vaultId: vault.id, deleted: false },
			include: { tags: true },
		});

		const result = await createexport(items, {
			format,
			encrypted: encrypted || false,
			password,
		});

		await db.auditLog.create({
			data: {
				userId: session.user.id,
				action: "export",
				details: JSON.stringify({
					format,
					encrypted: encrypted || false,
					itemCount: items.length,
				}),
				ip,
				userAgent: req.headers.get("user-agent") || undefined,
			},
		});

		return new NextResponse(result.content, {
			status: 200,
			headers: {
				"content-type": result.mimetype,
				"content-disposition": `attachment; filename="${result.filename}"`,
				"x-ratelimit-limit": "1",
				"x-ratelimit-remaining": String(remaining),
				"x-ratelimit-reset": String(reset),
				"x-export-warning": encrypted ? "" : "unencrypted",
			},
		});
	} catch {
		return NextResponse.json({ error: "export failed" }, { status: 500 });
	}
}
