import type { VaultItem } from "@/app/[locale]/vault/vault/store";
import type { LoginData, CardData, ApiData, SshData } from "./types";
import { checkpassword } from "./breach";
import { calculateentropy } from "./entropy";
import { hasweakpatterns } from "./patterns";

export type Health = {
	score: number;
	entropy: number;
	breached: boolean;
	reused: number;
	age: number;
	weak: boolean;
	suggestions: string[];
};

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
	items: Map<string, Health>;
};

const MIN_LENGTH = 12;
const OLD_DAYS = 90;
const MIN_ENTROPY = 60;

function extractpassword(item: VaultItem): string | null {
	if (item.type === "login") return (item.data as LoginData).password || null;
	if (item.type === "card") return (item.data as CardData).pin || null;
	if (item.type === "api") return (item.data as ApiData).secret || null;
	if (item.type === "ssh") return (item.data as SshData).passphrase || null;
	return null;
}

function daysold(updatedAt: string): number {
	const updated = new Date(updatedAt);
	const now = new Date();
	const diff = now.getTime() - updated.getTime();
	return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function checkreuse(password: string, vault: VaultItem[]): number {
	if (!password) return 0;
	let count = 0;

	for (const item of vault) {
		if (item.deleted) continue;
		const pw = extractpassword(item);
		if (pw === password) count++;
	}

	return Math.max(0, count - 1);
}

function suggestions(health: Health, password: string): string[] {
	const tips: string[] = [];

	if (health.breached) {
		tips.push("change immediately - found in data breaches");
	}

	if (health.reused > 0) {
		tips.push("use unique password for each account");
	}

	if (health.entropy < MIN_ENTROPY) {
		tips.push("increase length or add more character types");
	}

	if (password.length < MIN_LENGTH) {
		tips.push(`use at least ${MIN_LENGTH} characters`);
	}

	if (health.weak) {
		tips.push("avoid common patterns like keyboard walks or sequences");
	}

	if (health.age > OLD_DAYS) {
		tips.push("consider rotating password periodically");
	}

	if (!/[A-Z]/.test(password)) {
		tips.push("add uppercase letters");
	}

	if (!/[0-9]/.test(password)) {
		tips.push("add numbers");
	}

	if (!/[!@#$%^&*()_+\-=\[\]{}|;:',.<>?\/\\`~"]/.test(password)) {
		tips.push("add special characters");
	}

	return tips.slice(0, 5);
}

function calculatescore(health: Health): number {
	let score = 100;

	if (health.breached) score -= 40;
	if (health.reused > 0) score -= Math.min(30, health.reused * 10);
	if (health.weak) score -= 20;
	if (health.entropy < MIN_ENTROPY) score -= Math.min(20, Math.floor((MIN_ENTROPY - health.entropy) / 3));
	if (health.age > OLD_DAYS) score -= Math.min(10, Math.floor((health.age - OLD_DAYS) / 30) * 2);

	return Math.max(0, Math.min(100, score));
}

export async function analyzepassword(
	password: string,
	vault: VaultItem[] = [],
	updatedAt?: string
): Promise<Health> {
	if (!password) {
		return {
			score: 0,
			entropy: 0,
			breached: false,
			reused: 0,
			age: 0,
			weak: true,
			suggestions: ["password is empty"],
		};
	}

	const entropy = calculateentropy(password);
	const weak = hasweakpatterns(password) || entropy < MIN_ENTROPY;
	const reused = checkreuse(password, vault);
	const age = updatedAt ? daysold(updatedAt) : 0;

	let breached = false;
	try {
		const result = await checkpassword(password);
		breached = result.breached;
	} catch {
		breached = false;
	}

	const health: Health = {
		score: 0,
		entropy,
		breached,
		reused,
		age,
		weak,
		suggestions: [],
	};

	health.score = calculatescore(health);
	health.suggestions = suggestions(health, password);

	return health;
}

export async function analyze(items: VaultItem[]): Promise<HealthReport> {
	const healthMap = new Map<string, Health>();
	const issues: HealthIssue[] = [];
	let weakCount = 0;
	let oldCount = 0;
	let breachedCount = 0;

	const activeItems = items.filter((i) => !i.deleted);
	const passwordItems = activeItems.filter((i) => extractpassword(i) !== null);

	const checks = await Promise.allSettled(
		passwordItems.slice(0, 20).map(async (item) => {
			const password = extractpassword(item);
			if (!password) return null;
			const health = await analyzepassword(password, items, item.updatedAt);
			return { item, health, password };
		})
	);

	const reusedIds = new Set<string>();

	for (const check of checks) {
		if (check.status === "fulfilled" && check.value) {
			const { item, health, password } = check.value;
			healthMap.set(item.id, health);

			if (health.weak) {
				weakCount++;
				issues.push({
					id: `weak-${item.id}`,
					itemId: item.id,
					itemTitle: item.title,
					type: "weak",
					severity: "warning",
					message: password.length < MIN_LENGTH
						? `password is only ${password.length} characters`
						: "password lacks complexity or has weak patterns",
				});
			}

			if (health.age > OLD_DAYS) {
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

			if (health.breached) {
				breachedCount++;
				issues.push({
					id: `breached-${item.id}`,
					itemId: item.id,
					itemTitle: item.title,
					type: "breached",
					severity: "critical",
					message: "found in data breaches",
				});
			}

			if (health.reused > 0) {
				reusedIds.add(item.id);
				issues.push({
					id: `reused-${item.id}`,
					itemId: item.id,
					itemTitle: item.title,
					type: "reused",
					severity: "warning",
					message: `password shared with ${health.reused} other item${health.reused > 1 ? "s" : ""}`,
				});
			}
		}
	}

	const totalPasswords = passwordItems.length;
	const issueCount = weakCount + reusedIds.size + oldCount + breachedCount;
	const maxIssues = totalPasswords * 4;
	const score = totalPasswords === 0
		? 100
		: Math.max(0, Math.round(100 - (issueCount / maxIssues) * 100));

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
		items: healthMap,
	};
}

export { calculateentropy } from "./entropy";
export { detectpatterns, hasweakpatterns, type Pattern } from "./patterns";
