"use client";

import { useState, useCallback, useEffect } from "react";
import type { ItemType } from "@/lib/generated/prisma/enums";

type ViewMode = "list" | "grid";
type SortField = "title" | "type" | "updated" | "created";
type SortOrder = "asc" | "desc";

interface Props {
	onNew?: (type?: ItemType) => void;
	onSearch?: () => void;
	onRefresh?: () => void;
	onExport?: () => void;
	onImport?: () => void;
	onSettings?: () => void;
	viewMode?: ViewMode;
	onViewModeChange?: (mode: ViewMode) => void;
	sortField?: SortField;
	sortOrder?: SortOrder;
	onSortChange?: (field: SortField, order: SortOrder) => void;
	disabled?: boolean;
}

const iconpaths = {
	plus: "M12 5v14M5 12h14",
	search: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
	list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
	grid: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
	sortasc: "M3 4h13M3 8h9M3 12h5m8 8V4m0 16l4-4m-4 4l-4-4",
	sortdesc: "M3 4h13M3 8h9M3 12h5m8-8v16m0-16l4 4m-4-4l-4 4",
	refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
	upload: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5",
	download: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
	settings: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z",
	chevron: "M19 9l-7 7-7-7",
	login: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
	note: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
	card: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
	identity: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
	ssh: "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z",
	api: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
	otp: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
	passkey: "M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33",
};

const typelabels: Record<ItemType, string> = {
	login: "Login",
	note: "Note",
	card: "Card",
	identity: "Identity",
	ssh: "SSH Key",
	api: "API Key",
	otp: "OTP Code",
	passkey: "Passkey",
};

const alltypes: ItemType[] = ["login", "note", "card", "identity", "ssh", "api", "otp", "passkey"];

const sortlabels: Record<SortField, string> = {
	title: "Name",
	type: "Type",
	updated: "Last Modified",
	created: "Date Created",
};

function Svg({ path, className }: { path: string; className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d={path} />
		</svg>
	);
}

export function Toolbar({
	onNew,
	onSearch,
	onRefresh,
	onExport,
	onImport,
	onSettings,
	viewMode = "list",
	onViewModeChange,
	sortField = "updated",
	sortOrder = "desc",
	onSortChange,
	disabled,
}: Props) {
	const [showNewMenu, setShowNewMenu] = useState(false);
	const [showSortMenu, setShowSortMenu] = useState(false);

	const handlekeydown = useCallback(
		(e: KeyboardEvent) => {
			if (e.metaKey || e.ctrlKey) {
				switch (e.key.toLowerCase()) {
					case "n":
						e.preventDefault();
						onNew?.();
						break;
					case "f":
					case "k":
						e.preventDefault();
						onSearch?.();
						break;
				}
			}
		},
		[onNew, onSearch]
	);

	useEffect(() => {
		window.addEventListener("keydown", handlekeydown);
		return () => window.removeEventListener("keydown", handlekeydown);
	}, [handlekeydown]);

	useEffect(() => {
		function handleclick(e: MouseEvent) {
			const target = e.target as HTMLElement;
			if (!target.closest("[data-menu]")) {
				setShowNewMenu(false);
				setShowSortMenu(false);
			}
		}
		document.addEventListener("click", handleclick);
		return () => document.removeEventListener("click", handleclick);
	}, []);

	return (
		<div className="flex items-center gap-2 p-4 border-b border-white/[0.06]">
			{onNew && (
				<div className="relative" data-menu>
					<button
						onClick={() => setShowNewMenu(!showNewMenu)}
						disabled={disabled}
						className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-black text-sm font-medium rounded-lg hover:bg-[#FF6B00]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						<Svg path={iconpaths.plus} className="w-4 h-4" />
						<span className="hidden sm:inline">New Item</span>
						<Svg path={iconpaths.chevron} className="w-3.5 h-3.5 ml-1" />
					</button>
					{showNewMenu && (
						<div className="absolute left-0 top-full mt-2 bg-stone-800 border border-white/10 rounded-lg shadow-xl z-50 py-1 min-w-[160px]">
							<button
								onClick={() => {
									onNew();
									setShowNewMenu(false);
								}}
								className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
							>
								<Svg path={iconpaths.plus} className="w-4 h-4 text-white/60" />
								Any type
							</button>
							<div className="h-px bg-white/10 my-1" />
							{alltypes.map((type) => (
								<button
									key={type}
									onClick={() => {
										onNew(type);
										setShowNewMenu(false);
									}}
									className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
								>
									<Svg path={iconpaths[type]} className="w-4 h-4 text-white/50" />
									{typelabels[type]}
								</button>
							))}
						</div>
					)}
				</div>
			)}

			{onSearch && (
				<button
					onClick={onSearch}
					disabled={disabled}
					className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					title="Search (Cmd+F)"
				>
					<Svg path={iconpaths.search} className="w-4 h-4" />
					<span className="hidden md:flex items-center gap-1.5 text-xs text-white/40">
						<kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">F</kbd>
					</span>
				</button>
			)}

			<div className="flex-1" />

			{onViewModeChange && (
				<div className="hidden sm:flex items-center bg-white/5 rounded-lg p-0.5">
					<button
						onClick={() => onViewModeChange("list")}
						className={`p-2 rounded-md transition-colors ${
							viewMode === "list"
								? "bg-white/10 text-white"
								: "text-white/40 hover:text-white"
						}`}
						title="List view"
					>
						<Svg path={iconpaths.list} className="w-4 h-4" />
					</button>
					<button
						onClick={() => onViewModeChange("grid")}
						className={`p-2 rounded-md transition-colors ${
							viewMode === "grid"
								? "bg-white/10 text-white"
								: "text-white/40 hover:text-white"
						}`}
						title="Grid view"
					>
						<Svg path={iconpaths.grid} className="w-4 h-4" />
					</button>
				</div>
			)}

			{onSortChange && (
				<div className="relative hidden sm:block" data-menu>
					<button
						onClick={() => setShowSortMenu(!showSortMenu)}
						className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
					>
						<Svg path={sortOrder === "asc" ? iconpaths.sortasc : iconpaths.sortdesc} className="w-4 h-4" />
						<span className="text-sm">{sortlabels[sortField]}</span>
						<Svg path={iconpaths.chevron} className="w-3.5 h-3.5" />
					</button>
					{showSortMenu && (
						<div className="absolute right-0 top-full mt-2 bg-stone-800 border border-white/10 rounded-lg shadow-xl z-50 py-1 min-w-[160px]">
							{(Object.keys(sortlabels) as SortField[]).map((field) => (
								<button
									key={field}
									onClick={() => {
										onSortChange(field, sortField === field && sortOrder === "desc" ? "asc" : "desc");
										setShowSortMenu(false);
									}}
									className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
										sortField === field
											? "text-[#FF6B00] bg-[#FF6B00]/10"
											: "text-white/80 hover:text-white hover:bg-white/10"
									}`}
								>
									{sortlabels[field]}
									{sortField === field && (
										<Svg
											path={sortOrder === "asc" ? iconpaths.sortasc : iconpaths.sortdesc}
											className="w-3.5 h-3.5 text-[#FF6B00]"
										/>
									)}
								</button>
							))}
						</div>
					)}
				</div>
			)}

			<div className="h-6 w-px bg-white/10 hidden sm:block" />

			{onRefresh && (
				<button
					onClick={onRefresh}
					disabled={disabled}
					className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					title="Refresh"
				>
					<Svg path={iconpaths.refresh} className="w-4 h-4" />
				</button>
			)}

			{onImport && (
				<button
					onClick={onImport}
					disabled={disabled}
					className="hidden sm:flex p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					title="Import"
				>
					<Svg path={iconpaths.upload} className="w-4 h-4" />
				</button>
			)}

			{onExport && (
				<button
					onClick={onExport}
					disabled={disabled}
					className="hidden sm:flex p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					title="Export"
				>
					<Svg path={iconpaths.download} className="w-4 h-4" />
				</button>
			)}

			{onSettings && (
				<button
					onClick={onSettings}
					className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
					title="Settings"
				>
					<Svg path={iconpaths.settings} className="w-4 h-4" />
				</button>
			)}
		</div>
	);
}
