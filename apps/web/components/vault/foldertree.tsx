"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Icon } from "@/components/icons";
import { ContextMenu } from "./contextmenu";
import { FolderNode } from "./foldernode";
import type { FolderIcon, SpecialFolder } from "@/lib/types";
import type { FolderColor } from "@/lib/folders";

export interface TreeFolder {
	id: string;
	name: string;
	parentId: string | null;
	color: FolderColor;
	icon: FolderIcon;
	order: number;
	children: TreeFolder[];
	itemCount: number;
}

interface Props {
	folders: TreeFolder[];
	selected: string | SpecialFolder;
	onSelect: (id: string | SpecialFolder) => void;
	onCreate: (name: string, parentId: string | null) => void;
	onRename: (id: string, name: string) => void;
	onDelete: (id: string) => void;
	onMove: (folderId: string, newParentId: string | null, newOrder: number) => void;
	onMoveItems: (itemIds: string[], folderId: string | null) => void;
	onColorChange?: (id: string, color: FolderColor) => void;
	onIconChange?: (id: string, icon: FolderIcon) => void;
	totalCount: number;
	favoriteCount: number;
	trashCount: number;
}

interface ContextState {
	x: number;
	y: number;
	folderId: string;
}

export function FolderTree(props: Props) {
	const { folders, selected, onSelect, onCreate, onRename, onDelete, onMove, onMoveItems, onColorChange, onIconChange, totalCount, favoriteCount, trashCount } = props;
	const [expanded, setExpanded] = useState<Set<string>>(new Set());
	const [creating, setCreating] = useState<string | null>(null);
	const [newName, setNewName] = useState("");
	const [context, setContext] = useState<ContextState | null>(null);
	const [dragOver, setDragOver] = useState<string | null>(null);
	const [dragging, setDragging] = useState<string | null>(null);
	const createRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (creating !== null) createRef.current?.focus();
	}, [creating]);

	useEffect(() => {
		const close = () => setContext(null);
		document.addEventListener("click", close);
		return () => document.removeEventListener("click", close);
	}, []);

	const toggleExpand = useCallback((id: string) => {
		setExpanded((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	}, []);

	function startCreate(parentId: string | null) {
		setCreating(parentId);
		setNewName("");
		if (parentId) setExpanded((prev) => new Set([...prev, parentId]));
	}

	function saveCreate() {
		if (newName.trim()) onCreate(newName.trim(), creating);
		setCreating(null);
		setNewName("");
	}

	function handleDragOver(e: React.DragEvent, targetId: string | null) {
		e.preventDefault();
		if (e.dataTransfer.types.includes("folder-id") || e.dataTransfer.types.includes("text/plain")) {
			e.dataTransfer.dropEffect = "move";
			setDragOver(targetId);
		}
	}

	function handleDrop(e: React.DragEvent, targetId: string | null) {
		e.preventDefault();
		setDragOver(null);
		const folderId = e.dataTransfer.getData("folder-id");
		const itemId = e.dataTransfer.getData("text/plain");
		if (folderId && folderId !== targetId) {
			const children = targetId ? findFolder(folders, targetId)?.children || [] : folders;
			onMove(folderId, targetId, children.length);
		} else if (itemId) {
			onMoveItems([itemId], targetId);
		}
	}

	function handleContext(e: React.MouseEvent, folderId: string) {
		e.preventDefault();
		setContext({ x: e.clientX, y: e.clientY, folderId });
	}

	const activeStyle = "bg-[#d4b08c]/20 text-[#d4b08c]";
	const inactiveStyle = "text-white/60 hover:text-white hover:bg-white/5";

	return (
		<div className="space-y-1 select-none">
			<SpecialButton icon="all" label="All Items" count={totalCount} active={selected === "all"} onClick={() => onSelect("all")} dragOver={dragOver === "all"} onDragOver={(e) => handleDragOver(e, "all")} onDrop={(e) => { e.preventDefault(); setDragOver(null); const id = e.dataTransfer.getData("text/plain"); if (id) onMoveItems([id], null); }} onDragLeave={() => setDragOver(null)} />
			<SpecialButton icon="star" label="Favorites" count={favoriteCount} active={selected === "favorites"} onClick={() => onSelect("favorites")} />

			<div className="pt-4 pb-2">
				<div className="flex items-center justify-between px-3">
					<span className="text-xs text-white/40 uppercase tracking-wider font-medium">Folders</span>
					<button onClick={() => startCreate(null)} className="text-white/40 hover:text-white p-1 -mr-1 transition-colors" aria-label="create folder">
						<Icon name="plus" className="w-4 h-4" />
					</button>
				</div>
			</div>

			{folders.length === 0 && creating === null && <div className="px-3 py-2 text-xs text-white/30">No folders yet</div>}

			{folders.map((folder) => (
				<FolderNode key={folder.id} folder={folder} depth={0} selected={String(selected)} expanded={expanded} dragOver={dragOver} dragging={dragging} creating={creating} newName={newName} onSelect={onSelect} onContext={handleContext} onToggleExpand={toggleExpand} onDragStart={(e, id) => { e.dataTransfer.setData("folder-id", id); setDragging(id); }} onDragEnd={() => { setDragging(null); setDragOver(null); }} onDragOver={(e, id) => handleDragOver(e, id)} onDragLeave={() => setDragOver(null)} onDrop={(e, id) => handleDrop(e, id)} onNameChange={setNewName} onSaveCreate={saveCreate} onCancelCreate={() => { setCreating(null); setNewName(""); }} createRef={createRef} />
			))}

			{creating === null && (
				<div className="flex items-center gap-1 px-2 py-1.5 cursor-pointer text-white/30 hover:text-white/50" onClick={() => startCreate(null)}>
					<span className="w-5" />
					<Icon name="plus" className="w-4 h-4" />
					<span className="text-sm">New folder</span>
				</div>
			)}

			{creating !== null && !folders.some((f) => f.id === creating) ? (
				<div className="flex items-center gap-1 px-2 py-1.5" style={{ paddingLeft: "8px" }}>
					<span className="w-5" />
					<Icon name="folder" className="w-4 h-4 text-white/40" />
					<input ref={createRef} value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={saveCreate} onKeyDown={(e) => { if (e.key === "Enter") saveCreate(); if (e.key === "Escape") { setCreating(null); setNewName(""); } }} placeholder="folder name" className="flex-1 bg-transparent border-b border-white/20 outline-none text-sm text-white placeholder:text-white/30 py-0.5" />
				</div>
			) : null}

			<div className="pt-4">
				<SpecialButton icon="trash" label="Trash" count={trashCount} active={selected === "trash"} onClick={() => onSelect("trash")} hideZero />
			</div>

			{context && (
				<ContextMenu x={context.x} y={context.y} onRename={() => { const f = findFolder(folders, context.folderId); if (f) { const name = prompt("Rename folder", f.name); if (name?.trim()) onRename(context.folderId, name.trim()); } setContext(null); }} onDelete={() => { onDelete(context.folderId); setContext(null); }} onNewSubfolder={() => { startCreate(context.folderId); setContext(null); }} onColorChange={onColorChange ? (c) => { onColorChange(context.folderId, c); setContext(null); } : undefined} onIconChange={onIconChange ? (i) => { onIconChange(context.folderId, i); setContext(null); } : undefined} />
			)}
		</div>
	);
}

interface SpecialButtonProps {
	icon: "all" | "star" | "trash";
	label: string;
	count: number;
	active: boolean;
	onClick: () => void;
	hideZero?: boolean;
	dragOver?: boolean;
	onDragOver?: (e: React.DragEvent) => void;
	onDrop?: (e: React.DragEvent) => void;
	onDragLeave?: () => void;
}

function SpecialButton({ icon, label, count, active, onClick, hideZero, dragOver, onDragOver, onDrop, onDragLeave }: SpecialButtonProps) {
	const show = !hideZero || count > 0;
	return (
		<button type="button" className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${active ? "bg-[#d4b08c]/20 text-[#d4b08c]" : "text-white/60 hover:text-white hover:bg-white/5"} ${dragOver ? "ring-2 ring-[#d4b08c]" : ""}`} onClick={onClick} onDragOver={onDragOver} onDrop={onDrop} onDragLeave={onDragLeave}>
			<Icon name={icon} className={`w-4 h-4 ${active ? "text-[#d4b08c]" : "text-white/40"}`} />
			<span className="flex-1 text-sm text-left font-medium">{label}</span>
			{show && <span className={`text-xs ${active ? "text-[#d4b08c]/80" : "text-white/40"}`}>{count}</span>}
		</button>
	);
}

function findFolder(folders: TreeFolder[], id: string): TreeFolder | null {
	for (const f of folders) {
		if (f.id === id) return f;
		const found = findFolder(f.children, id);
		if (found) return found;
	}
	return null;
}
