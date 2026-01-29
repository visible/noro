"use client";

import { useState, useRef } from "react";
import type { ItemType } from "@/lib/generated/prisma/enums";

interface FolderData {
	id: string;
	name: string;
	parentId: string | null;
	icon: string;
}

type SpecialFolder = "all" | "favorites" | "trash";

interface Props {
	folders: FolderData[];
	selected: string | SpecialFolder;
	onSelect: (id: string | SpecialFolder) => void;
	onCreate?: (name: string, parentId: string | null) => void;
	onRename?: (id: string, name: string) => void;
	onDelete?: (id: string) => void;
	itemCounts?: Record<string, number>;
	favoriteCount?: number;
	trashCount?: number;
	totalCount?: number;
	typeCounts?: Record<ItemType, number>;
	onTypeFilter?: (type: ItemType | null) => void;
	selectedType?: ItemType | null;
}

const iconpaths = {
	folder: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
	folderplus: "M12 10v6m3-3H9m10-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-4",
	star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
	trash: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6",
	archive: "M21 8v13H3V8M1 3h22v5H1zM10 12h4",
	chevron: "M9 18l6-6-6-6",
	more: "M12 5v.01M12 12v.01M12 19v.01",
	pencil: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
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
	login: "Logins",
	note: "Notes",
	card: "Cards",
	identity: "Identities",
	ssh: "SSH Keys",
	api: "API Keys",
	otp: "OTP Codes",
	passkey: "Passkeys",
};

const alltypes: ItemType[] = ["login", "note", "card", "identity", "ssh", "api", "otp", "passkey"];

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

interface FolderItemProps {
	folder: FolderData;
	depth: number;
	selected: boolean;
	onSelect: () => void;
	onRename?: (name: string) => void;
	onDelete?: () => void;
	count: number;
	children?: React.ReactNode;
}

function FolderItemComponent({
	folder,
	depth,
	selected,
	onSelect,
	onRename,
	onDelete,
	count,
	children,
}: FolderItemProps) {
	const [expanded, setExpanded] = useState(true);
	const [editing, setEditing] = useState(false);
	const [name, setName] = useState(folder.name);
	const [showMenu, setShowMenu] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	function startEdit() {
		setEditing(true);
		setShowMenu(false);
		setTimeout(() => inputRef.current?.focus(), 0);
	}

	function saveEdit() {
		if (name.trim() && name !== folder.name) {
			onRename?.(name.trim());
		} else {
			setName(folder.name);
		}
		setEditing(false);
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter") saveEdit();
		if (e.key === "Escape") {
			setName(folder.name);
			setEditing(false);
		}
	}

	return (
		<div>
			<div
				className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
					selected
						? "bg-[#FF6B00]/20 text-[#FF6B00]"
						: "text-white/60 hover:text-white hover:bg-white/5"
				}`}
				style={{ paddingLeft: `${12 + depth * 16}px` }}
				onClick={onSelect}
			>
				{children && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							setExpanded(!expanded);
						}}
						className="p-0.5 -ml-1 text-white/40 hover:text-white transition-colors"
					>
						<Svg
							path={iconpaths.chevron}
							className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}
						/>
					</button>
				)}
				<Svg
					path={iconpaths.folder}
					className={`w-4 h-4 shrink-0 ${selected ? "text-[#FF6B00]" : "text-white/40"}`}
				/>
				{editing ? (
					<input
						ref={inputRef}
						value={name}
						onChange={(e) => setName(e.target.value)}
						onBlur={saveEdit}
						onKeyDown={handleKeyDown}
						className="flex-1 bg-transparent border-b border-white/20 outline-none text-sm"
						onClick={(e) => e.stopPropagation()}
					/>
				) : (
					<span className="flex-1 text-sm font-medium truncate">{folder.name}</span>
				)}
				{count > 0 && (
					<span className={`text-xs ${selected ? "text-[#FF6B00]/80" : "text-white/40"}`}>
						{count}
					</span>
				)}
				{(onRename || onDelete) && !editing && (
					<div className="relative">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								setShowMenu(!showMenu);
							}}
							className="p-1 opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-all"
						>
							<Svg path={iconpaths.more} className="w-4 h-4" />
						</button>
						{showMenu && (
							<div className="absolute right-0 top-full mt-1 bg-stone-800 border border-white/10 rounded-lg shadow-xl z-50 py-1 min-w-[120px]">
								{onRename && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											startEdit();
										}}
										className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors"
									>
										<Svg path={iconpaths.pencil} className="w-3.5 h-3.5" />
										rename
									</button>
								)}
								{onDelete && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											onDelete();
											setShowMenu(false);
										}}
										className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
									>
										<Svg path={iconpaths.trash} className="w-3.5 h-3.5" />
										delete
									</button>
								)}
							</div>
						)}
					</div>
				)}
			</div>
			{children && expanded && <div className="mt-0.5">{children}</div>}
		</div>
	);
}

export function VaultSidebar({
	folders,
	selected,
	onSelect,
	onCreate,
	onRename,
	onDelete,
	itemCounts = {},
	favoriteCount = 0,
	trashCount = 0,
	totalCount = 0,
	typeCounts,
	onTypeFilter,
	selectedType,
}: Props) {
	const [creating, setCreating] = useState(false);
	const [newName, setNewName] = useState("");
	const createRef = useRef<HTMLInputElement>(null);

	function startCreate() {
		setCreating(true);
		setNewName("");
		setTimeout(() => createRef.current?.focus(), 0);
	}

	function saveCreate() {
		if (newName.trim()) {
			onCreate?.(newName.trim(), null);
		}
		setCreating(false);
		setNewName("");
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter") saveCreate();
		if (e.key === "Escape") setCreating(false);
	}

	function buildTree(parentId: string | null, depth: number = 0): React.ReactNode {
		const children = folders.filter((f) => f.parentId === parentId);
		if (children.length === 0) return null;
		return children.map((folder) => {
			const nested = buildTree(folder.id, depth + 1);
			return (
				<FolderItemComponent
					key={folder.id}
					folder={folder}
					depth={depth}
					selected={selected === folder.id}
					onSelect={() => onSelect(folder.id)}
					onRename={onRename ? (name) => onRename(folder.id, name) : undefined}
					onDelete={onDelete ? () => onDelete(folder.id) : undefined}
					count={itemCounts[folder.id] || 0}
				>
					{nested}
				</FolderItemComponent>
			);
		});
	}

	return (
		<div className="flex flex-col h-full">
			<div className="p-4 space-y-1">
				<button
					type="button"
					className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
						selected === "all" && !selectedType
							? "bg-[#FF6B00]/20 text-[#FF6B00]"
							: "text-white/60 hover:text-white hover:bg-white/5"
					}`}
					onClick={() => {
						onSelect("all");
						onTypeFilter?.(null);
					}}
				>
					<Svg
						path={iconpaths.archive}
						className={`w-5 h-5 ${selected === "all" && !selectedType ? "text-[#FF6B00]" : "text-white/40"}`}
					/>
					<span className="flex-1 text-sm font-medium text-left">All Items</span>
					<span
						className={`text-xs ${selected === "all" && !selectedType ? "text-[#FF6B00]/80" : "text-white/40"}`}
					>
						{totalCount}
					</span>
				</button>

				<button
					type="button"
					className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
						selected === "favorites"
							? "bg-[#FF6B00]/20 text-[#FF6B00]"
							: "text-white/60 hover:text-white hover:bg-white/5"
					}`}
					onClick={() => onSelect("favorites")}
				>
					<Svg
						path={iconpaths.star}
						className={`w-5 h-5 ${selected === "favorites" ? "text-[#FF6B00]" : "text-white/40"}`}
					/>
					<span className="flex-1 text-sm font-medium text-left">Favorites</span>
					{favoriteCount > 0 && (
						<span className={`text-xs ${selected === "favorites" ? "text-[#FF6B00]/80" : "text-white/40"}`}>
							{favoriteCount}
						</span>
					)}
				</button>
			</div>

			{typeCounts && onTypeFilter && (
				<div className="px-4 pb-4 space-y-1">
					<div className="flex items-center px-3 py-2">
						<span className="text-xs text-white/40 uppercase tracking-wider font-medium">Types</span>
					</div>
					{alltypes.map((type) => {
						const count = typeCounts[type] || 0;
						if (count === 0) return null;
						const isactive = selectedType === type;
						return (
							<button
								key={type}
								type="button"
								onClick={() => onTypeFilter(isactive ? null : type)}
								className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
									isactive
										? "bg-[#FF6B00]/20 text-[#FF6B00]"
										: "text-white/60 hover:text-white hover:bg-white/5"
								}`}
							>
								<Svg path={iconpaths[type]} className={`w-4 h-4 ${isactive ? "text-[#FF6B00]" : "text-white/40"}`} />
								<span className="flex-1 text-sm text-left">{typelabels[type]}</span>
								<span className={`text-xs ${isactive ? "text-[#FF6B00]/80" : "text-white/40"}`}>
									{count}
								</span>
							</button>
						);
					})}
				</div>
			)}

			<div className="flex-1 overflow-y-auto scrollbar-hidden px-4">
				<div className="flex items-center justify-between px-3 py-2">
					<span className="text-xs text-white/40 uppercase tracking-wider font-medium">Folders</span>
					{onCreate && (
						<button
							onClick={startCreate}
							className="p-1 text-white/40 hover:text-white transition-colors"
							aria-label="create folder"
						>
							<Svg path={iconpaths.folderplus} className="w-4 h-4" />
						</button>
					)}
				</div>

				{creating && (
					<div className="flex items-center gap-2 px-3 py-2">
						<Svg path={iconpaths.folder} className="w-4 h-4 text-white/40" />
						<input
							ref={createRef}
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							onBlur={saveCreate}
							onKeyDown={handleKeyDown}
							placeholder="Folder name"
							className="flex-1 bg-transparent border-b border-white/20 outline-none text-sm text-white placeholder:text-white/30 py-1"
						/>
					</div>
				)}

				<div className="space-y-0.5">{buildTree(null)}</div>
			</div>

			<div className="p-4 border-t border-white/[0.06]">
				<button
					type="button"
					className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
						selected === "trash"
							? "bg-[#FF6B00]/20 text-[#FF6B00]"
							: "text-white/60 hover:text-white hover:bg-white/5"
					}`}
					onClick={() => onSelect("trash")}
				>
					<Svg
						path={iconpaths.trash}
						className={`w-5 h-5 ${selected === "trash" ? "text-[#FF6B00]" : "text-white/40"}`}
					/>
					<span className="flex-1 text-sm font-medium text-left">Trash</span>
					{trashCount > 0 && (
						<span className={`text-xs ${selected === "trash" ? "text-[#FF6B00]/80" : "text-white/40"}`}>
							{trashCount}
						</span>
					)}
				</button>
			</div>
		</div>
	);
}
