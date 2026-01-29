import { baseurl } from "./constants";

export { baseurl };

export interface StoreResponse {
	id: string;
}

export interface ClaimResponse {
	exists: boolean;
	data: string;
	type: "text" | "file";
	remaining: number;
	filename?: string;
	mimetype?: string;
}

export async function store(data: string, ttl = "1d", views = 1): Promise<StoreResponse> {
	const res = await fetch(`${baseurl}/store`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ data, ttl, views, type: "text" }),
	});
	if (!res.ok) throw new Error("failed to store secret");
	return res.json();
}

export async function claim(id: string): Promise<ClaimResponse> {
	const res = await fetch(`${baseurl}/claim/${id}`);
	if (!res.ok) throw new Error("failed to claim secret");
	return res.json();
}
