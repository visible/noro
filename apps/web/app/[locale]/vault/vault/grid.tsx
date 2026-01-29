"use client";

import type { VaultItem } from "./store";
import type { ItemType } from "@/lib/generated/prisma/enums";
import type { LoginData, CardData, IdentityData, ApiData, OtpData, PasskeyData } from "@/lib/types";

interface Props {
	items: VaultItem[];
	onItemClick: (item: VaultItem) => void;
	onFavorite: (id: string) => void;
	onTagClick?: (tag: string) => void;
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

const colors: Record<ItemType, string> = {
	login: "bg-blue-500/10 text-blue-400",
	note: "bg-amber-500/10 text-amber-400",
	card: "bg-emerald-500/10 text-emerald-400",
	identity: "bg-violet-500/10 text-violet-400",
	ssh: "bg-slate-500/10 text-slate-400",
	api: "bg-rose-500/10 text-rose-400",
	otp: "bg-cyan-500/10 text-cyan-400",
	passkey: "bg-fuchsia-500/10 text-fuchsia-400",
};

function getsubtitle(item: VaultItem): string | null {
	const data = item.data;
	switch (item.type) {
		case "login":
			return (data as LoginData).username || (data as LoginData).url || null;
		case "card":
			return (data as CardData).holder || null;
		case "identity": {
			const id = data as IdentityData;
			if (id.firstname || id.lastname) {
				return [id.firstname, id.lastname].filter(Boolean).join(" ");
			}
			return id.email || null;
		}
		case "api":
			return (data as ApiData).endpoint || null;
		case "otp":
			return (data as OtpData).issuer || (data as OtpData).account || null;
		case "passkey":
			return (data as PasskeyData).rpid || null;
		default:
			return null;
	}
}

export function VaultGrid({ items, onItemClick, onFavorite, onTagClick }: Props) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{items.map((item) => {
				const subtitle = getsubtitle(item);
				return (
					<div
						key={item.id}
						onClick={() => onItemClick(item)}
						className="group relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] rounded-xl p-4 cursor-pointer transition-all"
					>
						<div className="flex items-start gap-3">
							<div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colors[item.type]}`}>
								<svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={paths[item.type]} />
								</svg>
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
									{item.favorite && (
										<svg aria-hidden="true" className="w-3.5 h-3.5 text-[#d4b08c] shrink-0" fill="currentColor" viewBox="0 0 24 24">
											<path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
										</svg>
									)}
								</div>
								{subtitle && (
									<p className="text-xs text-white/40 truncate mt-0.5">{subtitle}</p>
								)}
							</div>
							<button
								onClick={(e) => { e.stopPropagation(); onFavorite(item.id); }}
								className={`p-1.5 rounded-md transition-all ${
									item.favorite
										? "text-[#d4b08c] hover:bg-[#d4b08c]/10"
										: "text-transparent group-hover:text-white/20 hover:!text-white/40 hover:!bg-white/5"
								}`}
								aria-label={item.favorite ? "remove from favorites" : "add to favorites"}
							>
								<svg aria-hidden="true" className="w-4 h-4" fill={item.favorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
								</svg>
							</button>
						</div>
						{item.tags.length > 0 && (
							<div className="flex gap-1.5 mt-3 flex-wrap">
								{item.tags.slice(0, 3).map((tag) => (
									<button
										key={tag}
										onClick={(e) => { e.stopPropagation(); onTagClick?.(tag); }}
										className="px-2 py-0.5 rounded-md text-[10px] bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60 transition-colors"
									>
										{tag}
									</button>
								))}
								{item.tags.length > 3 && (
									<span className="px-1.5 py-0.5 text-[10px] text-white/30">+{item.tags.length - 3}</span>
								)}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
