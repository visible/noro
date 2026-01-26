export const version = {
	current: "v0.5",
	all: [
		{ label: "v0.5", href: "/docs", current: true },
		{ label: "v1.0", href: null, current: false },
	],
};

export interface TocItem {
	id: string;
	title: string;
	level: number;
}

export const toc: Record<string, TocItem[]> = {
	"/docs": [
		{ id: "overview", title: "Overview", level: 2 },
		{ id: "features", title: "Features", level: 2 },
		{ id: "next-steps", title: "Next steps", level: 2 },
	],
	"/docs/cli": [
		{ id: "run-with-npx", title: "Run with npx", level: 2 },
		{ id: "global-install", title: "Global install", level: 2 },
		{ id: "quickstart", title: "Quickstart", level: 2 },
	],
	"/docs/cli/share": [
		{ id: "basic-usage", title: "Basic usage", level: 2 },
		{ id: "multiple-variables", title: "Multiple variables", level: 2 },
		{ id: "options", title: "Options", level: 2 },
		{ id: "where-values-come-from", title: "Where values come from", level: 2 },
	],
	"/docs/cli/claim": [
		{ id: "basic-usage", title: "Basic usage", level: 2 },
		{ id: "multiple-variables", title: "Multiple variables", level: 2 },
		{ id: "peek-first", title: "Peek first", level: 2 },
		{ id: "scripting", title: "Scripting", level: 2 },
	],
	"/docs/cli/push": [
		{ id: "basic-usage", title: "Basic usage", level: 2 },
		{ id: "options", title: "Options", level: 2 },
		{ id: "source-file", title: "Source file", level: 2 },
	],
	"/docs/cli/manage": [
		{ id: "list-secrets", title: "List secrets", level: 2 },
		{ id: "revoke-a-secret", title: "Revoke a secret", level: 2 },
		{ id: "local-history", title: "Local history", level: 2 },
	],
	"/docs/cli/config": [
		{ id: "view-config", title: "View config", level: 2 },
		{ id: "set-defaults", title: "Set defaults", level: 2 },
		{ id: "get-single-value", title: "Get single value", level: 2 },
		{ id: "unset-value", title: "Unset value", level: 2 },
		{ id: "available-keys", title: "Available keys", level: 2 },
		{ id: "config-file", title: "Config file", level: 2 },
	],
	"/docs/web": [
		{ id: "create", title: "Create a secret", level: 2 },
		{ id: "files", title: "Share files", level: 2 },
		{ id: "view", title: "View a secret", level: 2 },
		{ id: "privacy", title: "Privacy", level: 2 },
	],
	"/docs/encryption": [
		{ id: "algorithm", title: "Algorithm", level: 2 },
		{ id: "flow", title: "How it works", level: 2 },
		{ id: "key-storage", title: "Key storage", level: 2 },
		{ id: "zero-knowledge", title: "Zero-knowledge", level: 2 },
		{ id: "deletion", title: "Secure deletion", level: 2 },
	],
	"/docs/api": [
		{ id: "introduction", title: "Introduction", level: 2 },
		{ id: "quickstart", title: "Quickstart", level: 2 },
		{ id: "features", title: "Features", level: 2 },
	],
	"/docs/api/auth": [
		{ id: "api-keys", title: "API Keys", level: 2 },
		{ id: "generate", title: "Generate a key", level: 2 },
		{ id: "expiration", title: "Key expiration", level: 2 },
		{ id: "revoke", title: "Revoke a key", level: 2 },
		{ id: "update", title: "Update webhook", level: 2 },
		{ id: "usage", title: "Using your key", level: 2 },
		{ id: "security", title: "Security", level: 2 },
		{ id: "rate-limits", title: "Rate limits", level: 2 },
	],
	"/docs/api/endpoints": [
		{ id: "base-url", title: "Base URL", level: 2 },
		{ id: "health", title: "GET /health", level: 2 },
		{ id: "get-key", title: "GET /keys", level: 2 },
		{ id: "create-key", title: "POST /keys", level: 2 },
		{ id: "update-key", title: "PATCH /keys", level: 2 },
		{ id: "delete-key", title: "DELETE /keys", level: 2 },
		{ id: "create-secret", title: "POST /secrets", level: 2 },
		{ id: "claim-secret", title: "GET /secrets/:id", level: 2 },
		{ id: "revoke-secret", title: "DELETE /secrets/:id", level: 2 },
		{ id: "errors", title: "Error responses", level: 2 },
	],
	"/docs/api/webhooks": [
		{ id: "setup", title: "Setup", level: 2 },
		{ id: "events", title: "Events", level: 2 },
		{ id: "payload", title: "Payload", level: 2 },
		{ id: "headers", title: "Headers", level: 2 },
		{ id: "verification", title: "Verification", level: 2 },
		{ id: "delivery", title: "Delivery", level: 2 },
		{ id: "best-practices", title: "Best practices", level: 2 },
	],
	"/docs/desktop": [
		{ id: "features", title: "Planned features", level: 2 },
		{ id: "platforms", title: "Platforms", level: 2 },
		{ id: "notify", title: "Get notified", level: 2 },
	],
	"/docs/extension": [
		{ id: "features", title: "Planned features", level: 2 },
		{ id: "sync", title: "Sync with desktop", level: 2 },
		{ id: "browsers", title: "Supported browsers", level: 2 },
		{ id: "notify", title: "Get notified", level: 2 },
	],
};

export function gettoc(pathname: string): TocItem[] {
	const base = pathname.replace(/^\/(en|ja|ko|zh)/, "");
	return toc[base] || [];
}

export const navigation = [
	{
		title: "Get Started",
		section: "start",
		items: [
			{ title: "Introduction", href: "/docs" },
		],
	},
	{
		title: "CLI",
		section: "cli",
		items: [
			{ title: "Install", href: "/docs/cli" },
			{ title: "Share", href: "/docs/cli/share" },
			{ title: "Claim", href: "/docs/cli/claim" },
			{ title: "Push", href: "/docs/cli/push" },
			{ title: "Manage", href: "/docs/cli/manage" },
			{ title: "Config", href: "/docs/cli/config" },
		],
	},
	{
		title: "Web",
		section: "web",
		items: [
			{ title: "Overview", href: "/docs/web" },
		],
	},
	{
		title: "Security",
		section: "security",
		items: [
			{ title: "Encryption", href: "/docs/encryption" },
		],
	},
	{
		title: "API",
		section: "api",
		items: [
			{ title: "Overview", href: "/docs/api" },
			{ title: "Authentication", href: "/docs/api/auth" },
			{ title: "Endpoints", href: "/docs/api/endpoints" },
			{ title: "Webhooks", href: "/docs/api/webhooks" },
		],
	},
	{
		title: "Coming Soon",
		section: "future",
		items: [
			{ title: "Desktop", href: "/docs/desktop" },
			{ title: "Extension", href: "/docs/extension" },
		],
	},
];

export const pages = navigation.flatMap((group) =>
	group.items.map((item) => ({
		...item,
		section: group.section,
		sectionTitle: group.title,
	}))
);

const pagemap = new Map(pages.map((p) => [p.href, p]));
const pageindex = new Map(pages.map((p, i) => [p.href, i]));

const defaultpage = { title: "Docs", href: "/docs", section: "start", sectionTitle: "Get Started" };

export function getpage(pathname: string) {
	return pagemap.get(pathname) ?? defaultpage;
}

export function getprevnext(pathname: string) {
	const index = pageindex.get(pathname) ?? -1;
	return {
		prev: index > 0 ? pages[index - 1] : null,
		next: index >= 0 && index < pages.length - 1 ? pages[index + 1] : null,
	};
}
