"use client";

import { useState, useRef } from "react";
import { Icon } from "@/components/icons";
import type { FolderData } from "@/lib/types";

interface Props {
	folder: FolderData;
	depth: number;
	selected: boolean;
	onSelect: () => void;
	onRename: (name: string) => void;
	onDelete: () => void;
	onDrop: (itemId: string) => void;
	children?: React.ReactNode;
	count: number;
}

export function FolderItem({ folder, depth, selected, onSelect, onRename, onDelete, onDrop, children, count }: Props) {
	const [editing, setEditing] = useState(false);
	const [name, setName] = useState(folder.name);
	const [expanded, setExpanded] = useState(true);
	const [dragover, setDragover] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	function startEdit() {
		setEditing(true);
		setTimeout(() => inputRef.current?.select(), 0);
	}

	function saveEdit() {
		if (name.trim() && name !== folder.name) {
			onRename(name.trim());
		} else {
			setName(folder.name);
		}
		setEditing(false);
	}

	function handleDragOver(e: React.DragEvent) {
		e.preventDefault();
		setDragover(true);
	}

	function handleDrop(e: React.DragEvent) {
		e.preventDefault();
		setDragover(false);
		const itemId = e.dataTransfer.getData("text/plain");
		if (itemId) onDrop(itemId);
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
					selected ? "bg-orange-50 text-orange-600" : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
				} ${dragover ? "ring-2 ring-orange-500" : ""}`}
				style={{ paddingLeft: `${12 + depth * 16}px` }}
				onClick={onSelect}
				onDragOver={handleDragOver}
				onDragLeave={() => setDragover(false)}
				onDrop={handleDrop}
				onContextMenu={(e) => {
					e.preventDefault();
					startEdit();
				}}
			>
				{children && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							setExpanded(!expanded);
						}}
						className="w-6 h-6 flex items-center justify-center -ml-1"
						aria-label={expanded ? "collapse folder" : "expand folder"}
					>
						<Icon name="chevron" className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
					</button>
				)}
				<Icon name={folder.icon} className={`w-4 h-4 shrink-0 ${selected ? "text-orange-500" : "text-stone-400"}`} />
				{editing ? (
					<input
						ref={inputRef}
						value={name}
						onChange={(e) => setName(e.target.value)}
						onBlur={saveEdit}
						onKeyDown={handleKeyDown}
						className="flex-1 bg-transparent border-b border-stone-200 outline-none text-sm text-stone-900 py-1"
						onClick={(e) => e.stopPropagation()}
					/>
				) : (
					<span className="flex-1 text-sm font-medium truncate">{folder.name}</span>
				)}
				{count > 0 && <span className={`text-xs ${selected ? "text-orange-400" : "text-stone-400"}`}>{count}</span>}
				<button
					onClick={(e) => {
						e.stopPropagation();
						onDelete();
					}}
					className="opacity-0 group-hover:opacity-100 hover:text-red-500 p-2 -mr-1 transition-opacity"
					aria-label="delete folder"
				>
					<Icon name="close" className="w-3 h-3" />
				</button>
			</div>
			{expanded && children}
		</div>
	);
}
