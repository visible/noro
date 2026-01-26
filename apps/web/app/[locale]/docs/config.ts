export const version = {
	current: "v0.5",
	all: [
		{ label: "v0.5", href: "/docs", current: true },
		{ label: "v1.0", href: null, current: false },
	],
};

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
