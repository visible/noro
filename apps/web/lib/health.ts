import type { VaultItem } from "@/app/[locale]/vault/vault/store";
import type { LoginData, CardData, ApiData, SshData } from "./types";
import { checkpassword, type BreachResult } from "./breach";

export type IssueType = "weak" | "reused" | "old" | "breached";
export type IssueSeverity = "critical" | "warning" | "info";

export type HealthIssue = {
	id: string;
	itemId: string;
	itemTitle: string;
	type: IssueType;
	severity: IssueSeverity;
	message: string;
};

export type HealthReport = {
	score: number;
	totalPasswords: number;
	weakCount: number;
	reusedCount: number;
	oldCount: number;
	breachedCount: number;
	issues: HealthIssue[];
};

const SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{}|;:',.<>?\/\\"`~]/;
const MIN_LENGTH = 12;
const OLD_DAYS = 90;

export function strength(password: string): number {
	if (!password) return 0;

	let score = 0;
	if (password.length >= MIN_LENGTH) score += 25;
	else score += Math.floor((password.length / MIN_LENGTH) * 25);

	if (/[a-z]/.test(password)) score += 15;
	if (/[A-Z]/.test(password)) score += 15;
	if (/[0-9]/.test(password)) score += 20;
	if (SPECIAL_CHARS.test(password)) score += 25;

	return Math.min(100, score);
}

export function weak(password: string): boolean {
	if (!password) return true;
	if (password.length < MIN_LENGTH) return true;
	if (!SPECIAL_CHARS.test(password)) return true;
	return false;
}

export function old(updatedAt: string): boolean {
	const updated = new Date(updatedAt);
	const now = new Date();
	const diff = now.getTime() - updated.getTime();
	const days = diff / (1000 * 60 * 60 * 24);
	return days >= OLD_DAYS;
}

export function findreused(passwords: { id: string; password: string }[]): string[][] {
	const groups: Record<string, string[]> = {};

	for (const { id, password } of passwords) {
		if (!password) continue;
		if (!groups[password]) groups[password] = [];
		groups[password].push(id);
	}

	return Object.values(groups).filter((g) => g.length > 1);
}

export function extractpassword(item: VaultItem): string | null {
	if (item.type === "login") return (item.data as LoginData).password || null;
	if (item.type === "card") return (item.data as CardData).pin || null;
	if (item.type === "api") return (item.data as ApiData).secret || null;
	if (item.type === "ssh") return (item.data as SshData).passphrase || null;
	return null;
}

export async function analyze(items: VaultItem[]): Promise<HealthReport> {
	const issues: HealthIssue[] = [];
	const passwords: { id: string; password: string }[] = [];
	let weakCount = 0;
	let oldCount = 0;
	let breachedCount = 0;

	const activeItems = items.filter((i) => !i.deleted);
	const passwordItems = activeItems.filter((i) => extractpassword(i) !== null);

	for (const item of passwordItems) {
		const password = extractpassword(item);
		if (password) {
			passwords.push({ id: item.id, password });
		}
	}

	for (const item of passwordItems) {
		const password = extractpassword(item);
		if (!password) continue;

		if (weak(password)) {
			weakCount++;
			issues.push({
				id: `weak-${item.id}`,
				itemId: item.id,
				itemTitle: item.title,
				type: "weak",
				severity: "warning",
				message: password.length < MIN_LENGTH
					? `password is only ${password.length} characters`
					: "password lacks special characters",
			});
		}

		if (old(item.updatedAt)) {
			oldCount++;
			issues.push({
				id: `old-${item.id}`,
				itemId: item.id,
				itemTitle: item.title,
				type: "old",
				severity: "info",
				message: "password not changed in 90+ days",
			});
		}
	}

	const reusedGroups = findreused(passwords);
	const reusedIds = new Set<string>();

	for (const group of reusedGroups) {
		for (const id of group) {
			reusedIds.add(id);
			const item = passwordItems.find((i) => i.id === id);
			if (item) {
				issues.push({
					id: `reused-${id}`,
					itemId: id,
					itemTitle: item.title,
					type: "reused",
					severity: "warning",
					message: `password shared with ${group.length - 1} other item${group.length > 2 ? "s" : ""}`,
				});
			}
		}
	}

	const breachChecks = await Promise.allSettled(
		passwordItems.slice(0, 10).map(async (item) => {
			const password = extractpassword(item);
			if (!password) return null;
			const result = await checkpassword(password);
			return { item, result };
		})
	);

	for (const check of breachChecks) {
		if (check.status === "fulfilled" && check.value) {
			const { item, result } = check.value;
			if (result.breached) {
				breachedCount++;
				issues.push({
					id: `breached-${item.id}`,
					itemId: item.id,
					itemTitle: item.title,
					type: "breached",
					severity: "critical",
					message: `found in ${result.count.toLocaleString()} data breaches`,
				});
			}
		}
	}

	const totalPasswords = passwordItems.length;
	const issueCount = weakCount + reusedIds.size + oldCount + breachedCount;
	const maxIssues = totalPasswords * 4;
	const score = totalPasswords === 0 ? 100 : Math.max(0, Math.round(100 - (issueCount / maxIssues) * 100));

	issues.sort((a, b) => {
		const order: Record<IssueSeverity, number> = { critical: 0, warning: 1, info: 2 };
		return order[a.severity] - order[b.severity];
	});

	return {
		score,
		totalPasswords,
		weakCount,
		reusedCount: reusedIds.size,
		oldCount,
		breachedCount,
		issues,
	};
}
