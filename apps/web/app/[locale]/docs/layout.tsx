import type { Metadata, Viewport } from "next";
import { Sidebar } from "./sidebar";
import { Toc } from "./toc";
import { Breadcrumb } from "./breadcrumb";
import { MobileMenu } from "./mobile";

export const metadata: Metadata = {
	icons: {
		icon: "/docs/icon.svg",
	},
};

export const viewport: Viewport = {
	themeColor: "#0a0a0a",
};

const sidebarscript = `(function(){var s=document.querySelector('[data-sidebar]');var a=document.querySelector('[data-sidebar] [data-active]');if(s&&a){a.scrollIntoView({block:'nearest',behavior:'instant'})}})()`;

export default function DocsLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">

			<header className="shrink-0 bg-transparent">
				<div className="flex items-center justify-between py-6 px-6 md:px-12">
					<Breadcrumb />
					<MobileMenu />
				</div>
			</header>

			<div className="flex-1 flex min-h-0 px-4 md:px-8 lg:px-12 pb-4 md:pb-8 relative z-0">
				<div className="flex-1 flex bg-[#141414]/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg shadow-black/20 border border-white/5 relative z-0">
					<div className="absolute -left-1 top-1/3 w-1 h-24 bg-[#d4b08c] rounded-full hidden lg:block" />
					<Sidebar />
					<script dangerouslySetInnerHTML={{ __html: sidebarscript }} />
					<main className="flex-1 min-w-0 px-6 md:px-8 lg:px-12 overflow-y-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
						{children}
					</main>
					<Toc />
				</div>
			</div>
		</div>
	);
}
