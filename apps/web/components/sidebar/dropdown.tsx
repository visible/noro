"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/lib/client";
import { useRouter } from "next/navigation";

interface User {
	id: string;
	email: string;
	name: string;
	image?: string | null;
}

interface Props {
	user: User;
}

export function UserDropdown({ user }: Props) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const router = useRouter();

	useEffect(() => {
		function handle(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handle);
		return () => document.removeEventListener("mousedown", handle);
	}, []);

	async function handleLogout() {
		setOpen(false);
		await signOut();
		router.push("/");
	}

	const initials = (user.name || user.email)
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<div ref={ref} className="relative flex-1">
			<button
				onClick={() => setOpen(!open)}
				className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors duration-150"
			>
				<div className="w-7 h-7 rounded-md bg-[#FF6B00] flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
					{initials}
				</div>
				<div className="flex-1 text-left min-w-0">
					<p className="text-[13px] font-medium text-white/90 truncate leading-tight">{user.name || user.email}</p>
				</div>
				<svg
					aria-hidden="true"
					className={`w-3.5 h-3.5 text-white/30 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			{open && (
				<div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl py-1 z-50">
					<div className="px-3 py-2 border-b border-white/5">
						<p className="text-[11px] text-white/40 uppercase tracking-wide">signed in as</p>
						<p className="text-[13px] text-white/80 truncate mt-0.5">{user.email}</p>
					</div>
					<div className="py-1">
						<Link
							href="/vault/settings"
							className="flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-white/70 hover:bg-white/5 hover:text-white/90 transition-colors duration-150"
							onClick={() => setOpen(false)}
						>
							<svg aria-hidden="true" className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							settings
						</Link>
						<button
							onClick={handleLogout}
							className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-white/70 hover:bg-white/5 hover:text-white/90 transition-colors duration-150"
						>
							<svg aria-hidden="true" className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
							sign out
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
