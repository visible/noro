import type { Session } from "./types";

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
