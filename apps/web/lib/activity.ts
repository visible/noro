export type ActivityAction =
	| "login"
	| "logout"
	| "item_created"
	| "item_updated"
	| "item_deleted"
	| "item_viewed"
	| "password_changed"
	| "export"
	| "import";

export interface ActivityEntry {
	id: string;
	timestamp: string;
	action: ActivityAction;
	details: string;
	ip?: string;
}

const STORAGE_KEY = "noro_activity";
const MAX_ENTRIES = 500;

export function log(action: ActivityAction, details: string, ip?: string): void {
	const entries = list();
	const entry: ActivityEntry = {
		id: crypto.randomUUID(),
		timestamp: new Date().toISOString(),
		action,
		details,
		ip,
	};
	entries.unshift(entry);
	if (entries.length > MAX_ENTRIES) {
		entries.length = MAX_ENTRIES;
	}
	localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function list(): ActivityEntry[] {
	if (typeof window === "undefined") return [];
	const data = localStorage.getItem(STORAGE_KEY);
	if (!data) return [];
	try {
		return JSON.parse(data) as ActivityEntry[];
	} catch {
		return [];
	}
}

export function filter(action: ActivityAction | null, page: number, perPage: number): { entries: ActivityEntry[]; total: number } {
	let entries = list();
	if (action) {
		entries = entries.filter((e) => e.action === action);
	}
	const total = entries.length;
	const start = page * perPage;
	const end = start + perPage;
	return { entries: entries.slice(start, end), total };
}

export function clear(): void {
	localStorage.removeItem(STORAGE_KEY);
}

export function relative(date: string): string {
	const now = Date.now();
	const then = new Date(date).getTime();
	const diff = now - then;

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) return "just now";
	if (minutes < 60) return `${minutes}m ago`;
	if (hours < 24) return `${hours}h ago`;
	if (days < 7) return `${days}d ago`;
	return new Date(date).toLocaleDateString();
}

export const labels: Record<ActivityAction, string> = {
	login: "signed in",
	logout: "signed out",
	item_created: "created item",
	item_updated: "updated item",
	item_deleted: "deleted item",
	item_viewed: "viewed item",
	password_changed: "changed password",
	export: "exported vault",
	import: "imported data",
};
