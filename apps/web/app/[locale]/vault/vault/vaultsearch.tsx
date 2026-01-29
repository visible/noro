"use client";

import { forwardRef } from "react";
import type { ItemType } from "@/lib/generated/prisma/enums";

interface Props {
	search: string;
	onSearchChange: (value: string) => void;
	typeFilter: ItemType | null;
	onTypeFilterChange: (type: ItemType | null) => void;
	tagFilter: string | null;
	onTagFilterChange: (tag: string | null) => void;
	counts: Record<ItemType, number>;
	tags: string[];
	isTrash: boolean;
}

const paths: Record<ItemType, string> = {
	login: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
	note: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
	card: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
	identity: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
	ssh: "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z",
	api: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
	otp: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
	passkey: "M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33",
};

const labels: Record<ItemType, string> = {
	login: "logins",
	note: "notes",
	card: "cards",
	identity: "identities",
	ssh: "ssh",
	api: "api",
	otp: "otp",
	passkey: "passkeys",
};

const types: ItemType[] = ["login", "note", "card", "identity", "ssh", "api", "otp", "passkey"];

export const VaultSearch = forwardRef<HTMLInputElement, Props>(function VaultSearch({
	search,
	onSearchChange,
	typeFilter,
	onTypeFilterChange,
	tagFilter,
	onTagFilterChange,
	counts,
	tags,
	isTrash,
}, ref) {
	const total = Object.values(counts).reduce((a, b) => a + b, 0);
	const hasFilters = typeFilter || tagFilter;

	return (
		<div className="space-y-4">
			<div className="relative">
				<svg
					aria-hidden="true"
					className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
					/>
				</svg>
				<input
					ref={ref}
					type="text"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Search vault..."
					className="w-full bg-[#161616]/80 backdrop-blur-sm border border-white/5 rounded-xl pl-11 pr-11 py-3 text-sm text-[#ededed] placeholder:text-white/30 focus:outline-none focus:border-[#d4b08c]/30 focus:ring-1 focus:ring-[#d4b08c]/20 transition-all shadow-lg shadow-black/10"
				/>
				{search && (
					<button
						onClick={() => onSearchChange("")}
						className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-white/30 hover:text-white/50 rounded-md transition-colors"
						aria-label="clear search"
					>
						<svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				)}
			</div>

			{!isTrash && (
				<div className="flex flex-wrap items-center gap-2">
					<button
						onClick={() => onTypeFilterChange(null)}
						className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
							typeFilter === null
								? "bg-gradient-to-br from-[#d4b08c]/20 to-[#d4b08c]/10 text-[#d4b08c] border border-[#d4b08c]/20 shadow-lg shadow-[#d4b08c]/5"
								: "bg-[#161616]/80 text-white/50 border border-white/5 hover:text-white/70 hover:bg-[#1a1a1a]"
						}`}
					>
						all
						<span className={`ml-1.5 ${typeFilter === null ? "text-[#d4b08c]/70" : "text-white/30"}`}>{total}</span>
					</button>
					{types.map((type) => {
						const count = counts[type] || 0;
						if (count === 0) return null;
						const isActive = typeFilter === type;
						return (
							<button
								key={type}
								onClick={() => onTypeFilterChange(isActive ? null : type)}
								className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
									isActive
										? "bg-gradient-to-br from-[#d4b08c]/20 to-[#d4b08c]/10 text-[#d4b08c] border border-[#d4b08c]/20 shadow-lg shadow-[#d4b08c]/5"
										: "bg-[#161616]/80 text-white/50 border border-white/5 hover:text-white/70 hover:bg-[#1a1a1a]"
								}`}
							>
								<svg aria-hidden="true" className={`w-3.5 h-3.5 ${isActive ? "text-[#d4b08c]" : "text-white/40"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={paths[type]} />
								</svg>
								{labels[type]}
								<span className={`${isActive ? "text-[#d4b08c]/70" : "text-white/30"}`}>{count}</span>
							</button>
						);
					})}

					{tags.length > 0 && (
						<>
							<div className="w-px h-5 bg-white/[0.06] mx-1" />
							<svg aria-hidden="true" className="w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6h.008v.008H6V6z" />
							</svg>
							{tags.slice(0, 5).map((tag) => {
								const isActive = tagFilter === tag;
								return (
									<button
										key={tag}
										onClick={() => onTagFilterChange(isActive ? null : tag)}
										className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
											isActive
												? "bg-gradient-to-br from-[#d4b08c]/20 to-[#d4b08c]/10 text-[#d4b08c] border border-[#d4b08c]/20 shadow-lg shadow-[#d4b08c]/5"
												: "bg-[#161616]/80 text-white/40 border border-white/5 hover:text-white/60 hover:bg-[#1a1a1a]"
										}`}
									>
										{tag}
									</button>
								);
							})}
							{tags.length > 5 && (
								<span className="text-xs text-white/30">+{tags.length - 5} more</span>
							)}
						</>
					)}

					{hasFilters && (
						<button
							onClick={() => { onTypeFilterChange(null); onTagFilterChange(null); }}
							className="ml-auto text-xs text-white/40 hover:text-[#d4b08c] transition-colors"
						>
							clear filters
						</button>
					)}
				</div>
			)}
		</div>
	);
});
