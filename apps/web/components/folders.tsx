"use client";

import { useState, useRef } from "react";
import { Icon } from "@/components/icons";
import { FolderItem } from "@/components/folderitem";
import type { FolderData, SpecialFolder } from "@/lib/types";

interface Props {
	folders: FolderData[];
	selected: string | SpecialFolder;
	onSelect: (id: string | SpecialFolder) => void;
	onCreate: (name: string, parentId: string | null) => void;
	onRename: (id: string, name: string) => void;
	onDelete: (id: string) => void;
	onMove: (itemId: string, folderId: string | null) => void;
	itemCounts: Record<string, number>;
	favoriteCount: number;
	trashCount: number;
	totalCount: number;
}

export function Folders({
	folders,
	selected,
	onSelect,
	onCreate,
	onRename,
	onDelete,
	onMove,
	itemCounts,
	favoriteCount,
	trashCount,
	totalCount,
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
			onCreate(newName.trim(), null);
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
				<FolderItem
					key={folder.id}
					folder={folder}
					depth={depth}
					selected={selected === folder.id}
					onSelect={() => onSelect(folder.id)}
					onRename={(name) => onRename(folder.id, name)}
					onDelete={() => onDelete(folder.id)}
					onDrop={(itemId) => onMove(itemId, folder.id)}
					count={itemCounts[folder.id] || 0}
				>
					{nested}
				</FolderItem>
			);
		});
	}

	return (
		<div className="space-y-1">
			<button
				type="button"
				className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors min-h-[44px] ${
					selected === "all" ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5 active:bg-white/10"
				}`}
				onClick={() => onSelect("all")}
			>
				<Icon name="all" className="w-4 h-4" />
				<span className="flex-1 text-sm text-left">all items</span>
				<span className="text-xs text-white/40">{totalCount}</span>
			</button>

			<button
				type="button"
				className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors min-h-[44px] ${
					selected === "favorites" ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5 active:bg-white/10"
				}`}
				onClick={() => onSelect("favorites")}
			>
				<Icon name="star" className="w-4 h-4" />
				<span className="flex-1 text-sm text-left">favorites</span>
				<span className="text-xs text-white/40">{favoriteCount}</span>
			</button>

			<div className="pt-4 pb-2">
				<div className="flex items-center justify-between px-3">
					<span className="text-xs text-white/40 uppercase tracking-wider">folders</span>
					<button
						onClick={startCreate}
						className="text-white/40 hover:text-white active:text-white p-2 -mr-2"
						aria-label="create folder"
					>
						<Icon name="plus" className="w-4 h-4" />
					</button>
				</div>
			</div>

			{creating && (
				<div className="flex items-center gap-2 px-3 py-2.5 min-h-[44px]">
					<Icon name="folder" className="w-4 h-4 text-white/60" />
					<input
						ref={createRef}
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						onBlur={saveCreate}
						onKeyDown={handleKeyDown}
						placeholder="folder name"
						className="flex-1 bg-transparent border-b border-white/20 outline-none text-sm placeholder:text-white/30 py-1"
					/>
				</div>
			)}

			{buildTree(null)}

			<div className="pt-4">
				<button
					type="button"
					className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors min-h-[44px] ${
						selected === "trash" ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5 active:bg-white/10"
					}`}
					onClick={() => onSelect("trash")}
				>
					<Icon name="trash" className="w-4 h-4" />
					<span className="flex-1 text-sm text-left">trash</span>
					{trashCount > 0 && <span className="text-xs text-white/40">{trashCount}</span>}
				</button>
			</div>
		</div>
	);
}
