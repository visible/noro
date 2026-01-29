import type { Credential } from "./types";

export type { Credential };

export { getsession, setsession } from "./session";

export async function getcredentials(site: string): Promise<Credential[]> {
	const { credentials = [] } = await chrome.storage.local.get("credentials");
	return credentials.filter((c: Credential) => c.site === site || site.endsWith("." + c.site));
}

export async function savecredential(site: string, username: string, password: string): Promise<void> {
	const { credentials = [] } = await chrome.storage.local.get("credentials");
	const existing = credentials.findIndex(
		(c: Credential) => c.site === site && c.username === username
	);

	const cred: Credential = {
		id: crypto.randomUUID(),
		site,
		username,
		password,
		created: Date.now(),
	};

	if (existing >= 0) {
		credentials[existing] = cred;
	} else {
		credentials.unshift(cred);
	}

	await chrome.storage.local.set({ credentials });
}
