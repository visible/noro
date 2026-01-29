import type { VaultItem } from "./types";
import { getsession } from "./session";
import { baseurl } from "./constants";

export type { VaultItem };

export async function fetchitems(): Promise<{ success: boolean; items?: VaultItem[]; error?: string }> {
	const session = await getsession();
	if (!session) {
		return { success: false, error: "not authenticated" };
	}

	try {
		const res = await fetch(`${baseurl}/v1/vault/items`, {
			headers: { authorization: `Bearer ${session.token}` },
		});

		if (!res.ok) {
			if (res.status === 401) {
				await chrome.storage.local.remove("session");
				return { success: false, error: "session expired" };
			}
			return { success: false, error: "failed to load items" };
		}

		const data = await res.json();
		const items = (data.items || []).map((item: Record<string, unknown>) => {
			const parsed = typeof item.data === "string" ? JSON.parse(item.data as string) : item.data;
			return {
				id: item.id,
				type: item.type,
				title: item.title,
				username: parsed?.username,
				password: parsed?.password,
				url: parsed?.url,
				notes: parsed?.notes,
				favorite: item.favorite || false,
			};
		});

		return { success: true, items };
	} catch {
		return { success: false, error: "connection failed" };
	}
}

export function matchurl(itemurl: string | undefined, pageurl: string): boolean {
	if (!itemurl) return false;

	try {
		let normalized = itemurl;
		if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
			normalized = "https://" + normalized;
		}

		const itemhost = new URL(normalized).hostname.replace(/^www\./, "");
		const pagehost = new URL(pageurl).hostname.replace(/^www\./, "");

		return itemhost === pagehost || pagehost.endsWith("." + itemhost);
	} catch {
		return false;
	}
}

