"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import type { ItemType } from "@/lib/generated/prisma/enums";
import type { ItemDataMap, LoginData, CardData, IdentityData, ApiData, OtpData, PasskeyData } from "@/lib/types";

interface VaultItem {
	id: string;
	type: ItemType;
	title: string;
	data: ItemDataMap[ItemType];
	tags: string[];
	favorite: boolean;
	createdAt: string;
	updatedAt: string;
}

interface Props {
	items: VaultItem[];
	selectedId?: string | null;
	onSelect: (item: VaultItem) => void;
	onFavorite: (id: string) => void;
	onTagClick?: (tag: string) => void;
}

const iconpaths: Record<ItemType | "search" | "star" | "filter" | "tag" | "close", string> = {
	login: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
	note: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
	card: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
	identity: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
	ssh: "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z",
	api: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
	otp: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
	passkey: "M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33",
	search: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
	star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
	filter: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
	tag: "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z",
	close: "M6 18L18 6M6 6l12 12",
};

const typelabels: Record<ItemType, string> = {
	login: "logins",
	note: "notes",
	card: "cards",
	identity: "identities",
	ssh: "ssh keys",
	api: "api keys",
	otp: "otp codes",
	passkey: "passkeys",
};

const alltypes: ItemType[] = ["login", "note", "card", "identity", "ssh", "api", "otp", "passkey"];

function Svg({ path, className, fill }: { path: string; className?: string; fill?: boolean }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			viewBox="0 0 24 24"
			fill={fill ? "currentColor" : "none"}
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d={path} />
		</svg>
	);
}

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

export function ItemList({ items, selectedId, onSelect, onFavorite, onTagClick }: Props) {
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState<ItemType | null>(null);
	const [tagFilter, setTagFilter] = useState<string | null>(null);
	const [showFilters, setShowFilters] = useState(false);
	const searchRef = useRef<HTMLInputElement>(null);

	const handlekeydown = useCallback((e: KeyboardEvent) => {
		if ((e.metaKey || e.ctrlKey) && e.key === "f") {
			e.preventDefault();
			searchRef.current?.focus();
		}
	}, []);

	useEffect(() => {
		window.addEventListener("keydown", handlekeydown);
		return () => window.removeEventListener("keydown", handlekeydown);
	}, [handlekeydown]);

	const counts = useMemo(() => {
		const c: Record<ItemType, number> = {
			login: 0,
			note: 0,
			card: 0,
			identity: 0,
			ssh: 0,
			api: 0,
			otp: 0,
			passkey: 0,
		};
		items.forEach((item) => c[item.type]++);
		return c;
	}, [items]);

	const alltags = useMemo(() => {
		const set = new Set<string>();
		items.forEach((item) => item.tags.forEach((t) => set.add(t)));
		return Array.from(set).sort();
	}, [items]);

	const filtered = useMemo(() => {
		let result = items;

		if (search) {
			const q = search.toLowerCase();
			result = result.filter(
				(i) =>
					i.title.toLowerCase().includes(q) ||
					i.tags.some((t) => t.toLowerCase().includes(q))
			);
		}

		if (typeFilter) {
			result = result.filter((i) => i.type === typeFilter);
		}

		if (tagFilter) {
			result = result.filter((i) => i.tags.includes(tagFilter));
		}

		return result.sort((a, b) => {
			if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
			return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
		});
	}, [items, search, typeFilter, tagFilter]);

	const total = Object.values(counts).reduce((a, b) => a + b, 0);
	const activeFilters = (typeFilter ? 1 : 0) + (tagFilter ? 1 : 0);

	function handletagclick(tag: string) {
		setTagFilter(tagFilter === tag ? null : tag);
		onTagClick?.(tag);
	}

	function clearfilters() {
		setTypeFilter(null);
		setTagFilter(null);
	}

	return (
		<div className="flex flex-col h-full">
			<div className="p-4 space-y-3 border-b border-white/[0.06]">
				<div className="relative">
					<Svg
						path={iconpaths.search}
						className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
					/>
					<input
						ref={searchRef}
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search items..."
						className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#d4b08c]/50 focus:ring-1 focus:ring-[#d4b08c]/30 transition-all"
					/>
					{search && (
						<button
							onClick={() => setSearch("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors"
							aria-label="clear search"
						>
							<Svg path={iconpaths.close} className="w-4 h-4" />
						</button>
					)}
				</div>

				<div className="flex items-center gap-2">
					<button
						onClick={() => setShowFilters(!showFilters)}
						className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
							showFilters || activeFilters > 0
								? "bg-[#d4b08c]/20 text-[#d4b08c]"
								: "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
						}`}
					>
						<Svg path={iconpaths.filter} className="w-3.5 h-3.5" />
						filters
						{activeFilters > 0 && (
							<span className="w-4 h-4 rounded-full bg-[#d4b08c] text-black text-[10px] flex items-center justify-center">
								{activeFilters}
							</span>
						)}
					</button>
					{activeFilters > 0 && (
						<button
							onClick={clearfilters}
							className="text-xs text-white/40 hover:text-white transition-colors"
						>
							clear
						</button>
					)}
					<div className="flex-1" />
					<span className="text-xs text-white/40">
						{filtered.length} of {items.length}
					</span>
				</div>

				{showFilters && (
					<div className="space-y-3 pt-2">
						<div className="flex flex-wrap gap-1.5">
							<button
								onClick={() => setTypeFilter(null)}
								className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
									typeFilter === null
										? "bg-[#d4b08c]/20 text-[#d4b08c]"
										: "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
								}`}
							>
								all ({total})
							</button>
							{alltypes.map((type) => {
								const count = counts[type];
								if (count === 0) return null;
								const isactive = typeFilter === type;
								return (
									<button
										key={type}
										onClick={() => setTypeFilter(isactive ? null : type)}
										className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
											isactive
												? "bg-[#d4b08c]/20 text-[#d4b08c]"
												: "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
										}`}
									>
										<Svg path={iconpaths[type]} className="w-3.5 h-3.5" />
										{typelabels[type]} ({count})
									</button>
								);
							})}
						</div>

						{alltags.length > 0 && (
							<div className="flex flex-wrap gap-1.5 items-center">
								<Svg path={iconpaths.tag} className="w-3.5 h-3.5 text-white/40 mr-1" />
								{alltags.map((tag) => (
									<button
										key={tag}
										onClick={() => handletagclick(tag)}
										className={`px-2 py-1 rounded text-xs transition-colors ${
											tagFilter === tag
												? "bg-[#d4b08c]/20 text-[#d4b08c]"
												: "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
										}`}
									>
										{tag}
									</button>
								))}
							</div>
						)}
					</div>
				)}
			</div>

			<div className="flex-1 overflow-y-auto scrollbar-hidden">
				{filtered.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 px-4">
						<div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
							<Svg path={iconpaths.search} className="w-6 h-6 text-white/30" />
						</div>
						<p className="text-white/60 font-medium mb-1">No items found</p>
						<p className="text-white/40 text-sm text-center">
							{search || activeFilters > 0 ? "Try adjusting your search or filters" : "Add your first item to get started"}
						</p>
					</div>
				) : (
					<div className="divide-y divide-white/[0.04]">
						{filtered.map((item) => {
							const isselected = selectedId === item.id;
							const subtitle = getsubtitle(item);

							return (
								<div
									key={item.id}
									onClick={() => onSelect(item)}
									className={`flex items-center gap-3 px-4 py-3 cursor-pointer group transition-colors ${
										isselected ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
									}`}
								>
									<span className="text-white/40 shrink-0">
										<Svg path={iconpaths[item.type]} className="w-4 h-4" />
									</span>

									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<p className="text-sm font-medium text-white truncate">{item.title}</p>
											{item.favorite && (
												<Svg
													path={iconpaths.star}
													className="w-3 h-3 text-amber-400 shrink-0"
													fill
												/>
											)}
										</div>
										{subtitle && (
											<p className="text-xs text-white/40 truncate">{subtitle}</p>
										)}
									</div>

									<div className="hidden sm:flex gap-1 shrink-0">
										{item.tags.slice(0, 2).map((tag) => (
											<span
												key={tag}
												className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-white/40"
											>
												{tag}
											</span>
										))}
									</div>

									<button
										onClick={(e) => {
											e.stopPropagation();
											onFavorite(item.id);
										}}
										className={`p-1.5 rounded transition-all shrink-0 ${
											item.favorite
												? "text-amber-400"
												: "text-transparent group-hover:text-white/30 hover:!text-white/60"
										}`}
										aria-label={item.favorite ? "remove from favorites" : "add to favorites"}
									>
										<Svg
											path={iconpaths.star}
											className="w-4 h-4"
											fill={item.favorite}
										/>
									</button>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
