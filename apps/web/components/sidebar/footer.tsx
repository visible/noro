"use client";

import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";

export function SidebarFooter() {
	return (
		<div className="mt-auto border-t border-white/5 p-3">
			<nav className="space-y-0.5 mb-4">
				<a
					href="https://github.com/visible/noro"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-white/50 hover:bg-white/5 hover:text-white/70 transition-colors duration-150"
				>
					<svg aria-hidden="true" className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
					</svg>
					<span className="text-[13px]">docs</span>
				</a>
				<a
					href="mailto:support@noro.sh"
					className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-white/50 hover:bg-white/5 hover:text-white/70 transition-colors duration-150"
				>
					<svg aria-hidden="true" className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span className="text-[13px]">support</span>
				</a>
			</nav>
			<div className="flex items-center justify-center pt-3 border-t border-white/5">
				<Link href="/" className="p-1.5 hover:bg-white/5 rounded-md transition-colors duration-150 text-white/30 hover:text-white/50">
					<Logo />
				</Link>
			</div>
		</div>
	);
}
