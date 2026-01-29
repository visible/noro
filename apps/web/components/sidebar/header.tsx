"use client";

import { Logo } from "@/components/logo";
import { useSidebar } from "./context";

export function MobileHeader() {
	const { setOpen } = useSidebar();

	return (
		<div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0a0a0a] border-b border-white/5 flex items-center px-4 z-40">
			<button
				onClick={() => setOpen(true)}
				className="w-10 h-10 -ml-2 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors"
				aria-label="open menu"
			>
				<svg aria-hidden="true" className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
			<div className="flex-1 flex justify-center">
				<Logo />
			</div>
			<div className="w-10" />
		</div>
	);
}
