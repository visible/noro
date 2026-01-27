const defaulturl = "https://noro.sh/api/v1";

export interface NoroConfig {
	apikey: string;
	baseurl?: string;
}

export interface SecretOptions {
	ttl?: "1h" | "6h" | "12h" | "1d" | "7d";
	views?: number;
}

export interface FileOptions extends SecretOptions {
	filename: string;
	mimetype?: string;
}

export interface CreateResult {
	id: string;
	url: string;
	key: string;
}

export interface ClaimResult {
	data: string;
	type: "text" | "file";
	remaining: number;
	filename?: string;
	mimetype?: string;
}

export interface KeyInfo {
	hint: string;
	webhook: string | null;
	created: number;
	expires: number;
}

export interface KeyOptions {
	webhook?: string;
}

export interface RateLimit {
	limit: number;
	remaining: number;
	reset: number;
}

export class NoroError extends Error {
	status: number;
	ratelimit?: RateLimit;

	constructor(message: string, status: number, ratelimit?: RateLimit) {
		super(message);
		this.name = "NoroError";
		this.status = status;
		this.ratelimit = ratelimit;
	}
}

function generatekey(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(24));
	let key = "";
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 24; i++) {
		key += chars[bytes[i] % chars.length];
	}
	return key;
}

async function encrypt(text: string, key: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const keydata = encoder.encode(key.padEnd(32, "0").slice(0, 32));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const cryptokey = await crypto.subtle.importKey("raw", keydata, "AES-GCM", false, ["encrypt"]);
	const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptokey, data);
	const combined = new Uint8Array(iv.length + encrypted.byteLength);
	combined.set(iv);
	combined.set(new Uint8Array(encrypted), iv.length);
	return btoa(String.fromCharCode(...combined))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

async function decrypt(encoded: string, key: string): Promise<string> {
	const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	const iv = bytes.slice(0, 12);
	const data = bytes.slice(12);
	const keydata = new TextEncoder().encode(key.padEnd(32, "0").slice(0, 32));
	const cryptokey = await crypto.subtle.importKey("raw", keydata, "AES-GCM", false, ["decrypt"]);
	const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptokey, data);
	return new TextDecoder().decode(decrypted);
}

export { encrypt, decrypt, generatekey };

export class Noro {
	private apikey: string;
	private baseurl: string;

	constructor(config: NoroConfig) {
		this.apikey = config.apikey;
		this.baseurl = config.baseurl ?? defaulturl;
	}

	private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
		const res = await fetch(`${this.baseurl}${path}`, {
			method,
			headers: {
				authorization: `Bearer ${this.apikey}`,
				"content-type": "application/json",
			},
			body: body ? JSON.stringify(body) : undefined,
		});

		const data = await res.json().catch(() => ({ error: "invalid response" }));

		if (!res.ok) {
			const ratelimit =
				data.limit !== undefined
					? { limit: data.limit, remaining: data.remaining, reset: data.reset }
					: undefined;
			throw new NoroError(data.error || `request failed: ${res.status}`, res.status, ratelimit);
		}

		return data;
	}

	async share(text: string, options?: SecretOptions): Promise<CreateResult> {
		const key = generatekey();
		const encrypted = await encrypt(text, key);
		const result = await this.request<{ id: string; url: string }>("POST", "/secrets", {
			data: encrypted,
			type: "text",
			ttl: options?.ttl ?? "1d",
			views: options?.views ?? 1,
		});
		return {
			id: result.id,
			url: `${result.url}#${key}`,
			key,
		};
	}

	async sharefile(data: ArrayBuffer | Uint8Array, options: FileOptions): Promise<CreateResult> {
		const key = generatekey();
		const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
		const base64 = btoa(String.fromCharCode(...bytes));
		const encrypted = await encrypt(base64, key);
		const result = await this.request<{ id: string; url: string }>("POST", "/secrets", {
			data: encrypted,
			type: "file",
			filename: options.filename,
			mimetype: options.mimetype ?? "application/octet-stream",
			ttl: options.ttl ?? "1d",
			views: options.views ?? 1,
		});
		return {
			id: result.id,
			url: `${result.url}#${key}`,
			key,
		};
	}

	async claim(id: string, key: string): Promise<string> {
		const result = await this.request<ClaimResult>("GET", `/secrets/${id}`);
		return decrypt(result.data, key);
	}

	async claimfile(id: string, key: string): Promise<{ data: Uint8Array; filename?: string; mimetype?: string }> {
		const result = await this.request<ClaimResult>("GET", `/secrets/${id}`);
		const decrypted = await decrypt(result.data, key);
		const binary = atob(decrypted);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		return {
			data: bytes,
			filename: result.filename,
			mimetype: result.mimetype,
		};
	}

	async claimraw(id: string): Promise<ClaimResult> {
		return this.request<ClaimResult>("GET", `/secrets/${id}`);
	}

	async revoke(id: string): Promise<boolean> {
		const result = await this.request<{ deleted: boolean }>("DELETE", `/secrets/${id}`);
		return result.deleted;
	}

	async key(): Promise<KeyInfo> {
		return this.request<KeyInfo>("GET", "/keys");
	}

	async updatekey(options: KeyOptions): Promise<boolean> {
		const result = await this.request<{ updated: boolean }>("PATCH", "/keys", options);
		return result.updated;
	}

	async deletekey(): Promise<boolean> {
		const result = await this.request<{ deleted: boolean }>("DELETE", "/keys");
		return result.deleted;
	}
}

export async function createkey(options?: KeyOptions & { baseurl?: string }): Promise<{ key: string; expires: number }> {
	const baseurl = options?.baseurl ?? defaulturl;
	const res = await fetch(`${baseurl}/keys`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: options?.webhook ? JSON.stringify({ webhook: options.webhook }) : "{}",
	});

	if (!res.ok) {
		const data = await res.json().catch(() => ({ error: "request failed" }));
		throw new NoroError(data.error || `request failed: ${res.status}`, res.status);
	}

	return res.json();
}

export function parseurl(url: string): { id: string; key: string } | null {
	try {
		const parsed = new URL(url);
		const id = parsed.pathname.split("/").pop();
		const key = parsed.hash.slice(1);
		if (!id || !key) return null;
		return { id, key };
	} catch {
		return null;
	}
}

export default Noro;
