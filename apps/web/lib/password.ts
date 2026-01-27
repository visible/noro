import argon2 from "argon2";

const argonConfig = {
	type: argon2.argon2id,
	memoryCost: 65536,
	timeCost: 3,
	parallelism: 4,
};

export async function hashPassword(password: string, salt: string): Promise<string> {
	return argon2.hash(password + salt, argonConfig);
}

export async function verifyPassword(
	password: string,
	salt: string,
	hash: string,
): Promise<boolean> {
	return argon2.verify(hash, password + salt);
}

export function generateSalt(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return Buffer.from(bytes).toString("base64");
}

export function generateSecretKey(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	const b32 = Buffer.from(bytes).toString("base64").replace(/[+/=]/g, "").slice(0, 26);
	return `A3-${chunk(b32, 6).join("-")}`;
}

function chunk(str: string, size: number): string[] {
	const chunks: string[] = [];
	for (let i = 0; i < str.length; i += size) {
		chunks.push(str.slice(i, i + size));
	}
	return chunks;
}

export function generateRecoveryCodes(): string[] {
	const codes: string[] = [];
	for (let i = 0; i < 10; i++) {
		const bytes = crypto.getRandomValues(new Uint8Array(6));
		const code = Buffer.from(bytes).toString("hex").toUpperCase();
		codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`);
	}
	return codes;
}
