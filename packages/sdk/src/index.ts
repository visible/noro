const baseurl = "https://noro.sh/api/v1";

export interface NoroOptions {
	apikey: string;
	baseurl?: string;
}

export interface SecretOptions {
	ttl?: "1h" | "6h" | "12h" | "1d" | "7d";
	views?: number;
	type?: "text" | "file";
	filename?: string;
	mimetype?: string;
}

export interface Secret {
	id: string;
	url: string;
}

export interface ClaimedSecret {
	data: string;
	type: "text" | "file";
	remaining: number;
	filename?: string;
	mimetype?: string;
}

export interface KeyInfo {
	webhook: string | null;
	created: number;
}

export interface KeyOptions {
	webhook?: string;
}

export class Noro {
	private apikey: string;
	private baseurl: string;

	constructor(options: NoroOptions) {
		this.apikey = options.apikey;
		this.baseurl = options.baseurl ?? baseurl;
	}

	private async request<T>(
		method: string,
		path: string,
		body?: unknown
	): Promise<T> {
		const res = await fetch(`${this.baseurl}${path}`, {
			method,
			headers: {
				"authorization": `Bearer ${this.apikey}`,
				"content-type": "application/json",
			},
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!res.ok) {
			const error = await res.json().catch(() => ({ error: "request failed" }));
			throw new Error(error.error || `request failed: ${res.status}`);
		}

		return res.json();
	}

	async create(data: string, options?: SecretOptions): Promise<Secret> {
		return this.request<Secret>("POST", "/secrets", {
			data,
			ttl: options?.ttl ?? "1d",
			views: options?.views ?? 1,
			type: options?.type ?? "text",
			filename: options?.filename,
			mimetype: options?.mimetype,
		});
	}

	async claim(id: string): Promise<ClaimedSecret> {
		return this.request<ClaimedSecret>("GET", `/secrets/${id}`);
	}

	async revoke(id: string): Promise<{ deleted: boolean }> {
		return this.request<{ deleted: boolean }>("DELETE", `/secrets/${id}`);
	}

	async key(): Promise<KeyInfo> {
		return this.request<KeyInfo>("GET", "/keys");
	}

	async updatekey(options: KeyOptions): Promise<{ updated: boolean }> {
		return this.request<{ updated: boolean }>("PATCH", "/keys", options);
	}

	async deletekey(): Promise<{ deleted: boolean }> {
		return this.request<{ deleted: boolean }>("DELETE", "/keys");
	}
}

export async function createkey(
	options?: KeyOptions & { baseurl?: string }
): Promise<{ key: string }> {
	const res = await fetch(`${options?.baseurl ?? baseurl}/keys`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: options?.webhook ? JSON.stringify({ webhook: options.webhook }) : undefined,
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({ error: "request failed" }));
		throw new Error(error.error || `request failed: ${res.status}`);
	}

	return res.json();
}

export default Noro;
