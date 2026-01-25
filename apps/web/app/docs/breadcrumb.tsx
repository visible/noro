"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getpage } from "./config";

const sectionNames: Record<string, string> = {
	start: "Get Started",
	usage: "Usage",
	security: "Security",
	future: "Coming Soon",
};

const chevron = (
	<svg className="w-3 h-3 text-black/20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export function Breadcrumb() {
	const pathname = usePathname();
	const page = getpage(pathname);

	return (
		<>
			<div className="hidden md:flex items-center">
				<Link href="/" className="group flex items-center gap-3 px-3 py-1.5 -ml-3 rounded-lg hover:bg-black/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C53D43]">
					<div className="w-2 h-2 rounded-full bg-[#C53D43]" />
					<span className="font-medium text-sm text-black tracking-wide">noro</span>
				</Link>
				{chevron}
				<span className="px-2 py-1 text-sm text-black/40">{sectionNames[page.section]}</span>
				{chevron}
				<span className="px-2 py-1 text-sm font-medium text-[#C53D43]">{page.title}</span>
			</div>
			<div className="flex md:hidden items-center gap-2">
				<Link href="/" className="flex items-center gap-2">
					<div className="w-2 h-2 rounded-full bg-[#C53D43]" />
					<span className="font-semibold text-black">noro</span>
				</Link>
				<span className="text-black/30">/</span>
				<span className="text-black/60">{page.title}</span>
			</div>
		</>
	);
}
