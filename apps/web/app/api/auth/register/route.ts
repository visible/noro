import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, generateSalt, generateSecretKey, generateRecoveryCodes } from "@/lib/password";
import { createSession } from "@/lib/auth";
import { upload, vaultkey } from "@/lib/r2";

export async function POST(req: Request) {
	try {
		const { email, password, name } = await req.json();

		if (!email || !password) {
			return NextResponse.json({ error: "email and password required" }, { status: 400 });
		}

		const existing = await db.user.findUnique({ where: { email } });
		if (existing) {
			return NextResponse.json({ error: "email already registered" }, { status: 409 });
		}

		const salt = generateSalt();
		const secretKey = generateSecretKey();
		const recoveryCodes = generateRecoveryCodes();

		const combinedPassword = password + secretKey;
		const keyHash = await hashPassword(combinedPassword, salt);

		const vaultKeyBytes = crypto.getRandomValues(new Uint8Array(32));
		const vaultKeyB64 = Buffer.from(vaultKeyBytes).toString("base64");

		const encryptedKey = await encryptVaultKey(vaultKeyB64, combinedPassword, salt);

		const user = await db.user.create({
			data: {
				email,
				name,
				salt,
				keyHash,
				encryptedKey,
			},
		});

		await db.vault.create({
			data: {
				userId: user.id,
				blobKey: vaultkey(user.id),
			},
		});

		const emptyVault = Buffer.from(JSON.stringify({ items: [], revision: 0 }));
		await upload(vaultkey(user.id), emptyVault);

		const ip = req.headers.get("x-forwarded-for")?.split(",")[0];
		const userAgent = req.headers.get("user-agent") || undefined;
		await createSession(user.id, ip, userAgent);

		return NextResponse.json({
			success: true,
			secretKey,
			recoveryCodes,
		});
	} catch (error) {
		console.error("register error:", error);
		return NextResponse.json({ error: "registration failed" }, { status: 500 });
	}
}

async function encryptVaultKey(key: string, password: string, salt: string): Promise<string> {
	const encoder = new TextEncoder();
	const keyData = encoder.encode(password + salt);
	const keyMaterial = await crypto.subtle.digest("SHA-256", keyData);
	const cryptoKey = await crypto.subtle.importKey("raw", keyMaterial, "AES-GCM", false, [
		"encrypt",
	]);

	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encrypted = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		cryptoKey,
		encoder.encode(key),
	);

	const combined = new Uint8Array(iv.length + encrypted.byteLength);
	combined.set(iv);
	combined.set(new Uint8Array(encrypted), iv.length);

	return Buffer.from(combined).toString("base64");
}
