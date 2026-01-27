import { encrypt, generatekey } from "./crypto";
import { store } from "./api";

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
});
