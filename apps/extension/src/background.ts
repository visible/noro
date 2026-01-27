import { encrypt, generatekey } from "./crypto";
import { store } from "./api";
import { getcredentials, savecredential } from "./credentials";

const baseurl = "https://noro.sh/api";

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: "share",
		title: "share with noro",
		contexts: ["selection"],
	});
});

chrome.contextMenus.onClicked.addListener(async (info) => {
	if (info.menuItemId !== "share" || !info.selectionText) return;

	try {
		const key = generatekey();
		const encrypted = await encrypt(info.selectionText, key);
		const { id } = await store(encrypted);
		const url = `https://noro.sh/${id}#${key}`;

		await saverecent({ id, url, preview: info.selectionText.slice(0, 50), created: Date.now() });
		await navigator.clipboard.writeText(url);

		chrome.notifications.create({
			type: "basic",
			iconUrl: "icons/128.png",
			title: "noro",
			message: "secret url copied to clipboard",
		});
	} catch {
		chrome.notifications.create({
			type: "basic",
			iconUrl: "icons/128.png",
			title: "noro",
			message: "failed to share secret",
		});
	}
});

interface RecentSecret {
	id: string;
	url: string;
	preview: string;
	created: number;
}

async function saverecent(secret: RecentSecret) {
	const { recents = [] } = await chrome.storage.local.get("recents");
	const updated = [secret, ...recents.slice(0, 9)];
	await chrome.storage.local.set({ recents: updated });
}

async function getsession() {
	const { session } = await chrome.storage.local.get("session");
	return session || null;
}

chrome.runtime.onMessage.addListener((message, _, respond) => {
	if (message.type === "share") {
		(async () => {
			try {
				const key = generatekey();
				const encrypted = await encrypt(message.text, key);
				const { id } = await store(encrypted, message.ttl, message.views);
				const url = `https://noro.sh/${id}#${key}`;
				await saverecent({ id, url, preview: message.text.slice(0, 50), created: Date.now() });
				respond({ success: true, url });
			} catch {
				respond({ success: false });
			}
		})();
		return true;
	}

	if (message.type === "recents") {
		chrome.storage.local.get("recents").then(({ recents = [] }) => {
			respond(recents);
		});
		return true;
	}

	if (message.type === "login") {
		(async () => {
			try {
				const res = await fetch(`${baseurl}/auth/sign-in/email`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						email: message.email,
						password: message.password,
					}),
				});

				if (!res.ok) {
					const data = await res.json().catch(() => ({}));
					respond({ success: false, error: data.message || "invalid credentials" });
					return;
				}

				const data = await res.json();
				respond({ success: true, token: data.token || "session" });
			} catch {
				respond({ success: false, error: "connection failed" });
			}
		})();
		return true;
	}

	if (message.type === "items") {
		(async () => {
			try {
				const session = await getsession();
				if (!session) {
					respond({ success: false, error: "not authenticated" });
					return;
				}

				const res = await fetch(`${baseurl}/v1/vault/items`, {
					headers: {
						authorization: `Bearer ${session.token}`,
					},
				});

				if (!res.ok) {
					if (res.status === 401) {
						await chrome.storage.local.remove("session");
						respond({ success: false, error: "session expired" });
						return;
					}
					respond({ success: false, error: "failed to load items" });
					return;
				}

				const data = await res.json();
				const items = (data.items || []).map((item: Record<string, unknown>) => {
					const parsed = typeof item.data === "string" ? JSON.parse(item.data) : item.data;
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
				respond({ success: true, items });
			} catch {
				respond({ success: false, error: "connection failed" });
			}
		})();
		return true;
	}

	if (message.type === "credentials") {
		getcredentials(message.site).then(respond);
		return true;
	}

	if (message.type === "savecredential") {
		savecredential(message.site, message.username, message.password).then(() => {
			chrome.notifications.create({
				type: "basic",
				iconUrl: "icons/128.png",
				title: "noro",
				message: "login saved",
			});
			respond({ success: true });
		});
		return true;
	}
});
