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
		title: "Usage",
		section: "usage",
		items: [
			{ title: "CLI", href: "/docs/cli" },
			{ title: "Web", href: "/docs/web" },
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

export function getpage(pathname: string) {
	return pages.find((p) => p.href === pathname) ?? { title: "Docs", href: "/docs", section: "start", sectionTitle: "Get Started" };
}

export function getprevnext(pathname: string) {
	const index = pages.findIndex((p) => p.href === pathname);
	return {
		prev: index > 0 ? pages[index - 1] : null,
		next: index < pages.length - 1 ? pages[index + 1] : null,
	};
}
