const baseurl = "https://noro.sh/api";

export interface VaultItem {
	id: string;
	type: string;
	title: string;
	username?: string;
	password?: string;
	url?: string;
	notes?: string;
	favorite: boolean;
}

export interface Session {
	email: string;
	token: string;
}

export async function getsession(): Promise<Session | null> {
	const { session } = await chrome.storage.local.get("session");
	return session || null;
}

export async function setsession(session: Session | null): Promise<void> {
	if (session) {
		await chrome.storage.local.set({ session });
	} else {
		await chrome.storage.local.remove("session");
	}
}

export async function login(email: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
	try {
		const res = await fetch(`${baseurl}/auth/sign-in/email`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			return { success: false, error: data.message || "invalid credentials" };
		}

		const data = await res.json();
		return { success: true, token: data.token || "session" };
	} catch {
		return { success: false, error: "connection failed" };
	}
}

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

export function getmatchingitems(items: VaultItem[], url: string): VaultItem[] {
	return items.filter((item) => item.type === "login" && matchurl(item.url, url));
}

export function generatepassword(length = 20): string {
	const lower = "abcdefghijklmnopqrstuvwxyz";
	const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const digits = "0123456789";
	const symbols = "!@#$%^&*";
	const all = lower + upper + digits + symbols;

	const bytes = crypto.getRandomValues(new Uint8Array(length));
	let password = "";

	password += lower[bytes[0] % lower.length];
	password += upper[bytes[1] % upper.length];
	password += digits[bytes[2] % digits.length];
	password += symbols[bytes[3] % symbols.length];

	for (let i = 4; i < length; i++) {
		password += all[bytes[i] % all.length];
	}

	const shuffled = password.split("");
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = bytes[i % bytes.length] % (i + 1);
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	return shuffled.join("");
}
