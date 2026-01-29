"use client";

import { Icon } from "@/components/icons";
import type { FolderColor } from "@/lib/folders";
import type { TreeFolder } from "./foldertree";

interface Props {
	folder: TreeFolder;
	depth: number;
	selected: string;
	expanded: Set<string>;
	dragOver: string | null;
	dragging: string | null;
	creating: string | null;
	newName: string;
	onSelect: (id: string) => void;
	onContext: (e: React.MouseEvent, id: string) => void;
	onToggleExpand: (id: string) => void;
	onDragStart: (e: React.DragEvent, id: string) => void;
	onDragEnd: () => void;
	onDragOver: (e: React.DragEvent, id: string) => void;
	onDragLeave: () => void;
	onDrop: (e: React.DragEvent, id: string) => void;
	onNameChange: (name: string) => void;
	onSaveCreate: () => void;
	onCancelCreate: () => void;
	createRef: React.RefObject<HTMLInputElement | null>;
}

const colorClasses: Record<FolderColor, string> = {
	default: "text-white/40",
	red: "text-red-500",
	orange: "text-orange-500",
	yellow: "text-yellow-500",
	green: "text-green-500",
	blue: "text-blue-500",
	purple: "text-purple-500",
	pink: "text-pink-500",
};

export function FolderNode({
	folder,
	depth,
	selected,
	expanded,
	dragOver,
	dragging,
	creating,
	newName,
	onSelect,
	onContext,
	onToggleExpand,
	onDragStart,
	onDragEnd,
	onDragOver,
	onDragLeave,
	onDrop,
	onNameChange,
	onSaveCreate,
	onCancelCreate,
	createRef,
}: Props) {
	const isExpanded = expanded.has(folder.id);
	const hasChildren = folder.children.length > 0;
	const isSelected = selected === folder.id;
	const isDragOver = dragOver === folder.id;
	const isDragging = dragging === folder.id;

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter") onSaveCreate();
		if (e.key === "Escape") onCancelCreate();
	}

	return (
		<div className={isDragging ? "opacity-50" : ""}>
			<div
				className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
					isSelected
						? "bg-[#FF6B00]/20 text-[#FF6B00]"
						: "text-white/60 hover:text-white hover:bg-white/5"
				} ${isDragOver ? "ring-2 ring-[#FF6B00]" : ""}`}
				style={{ paddingLeft: `${8 + depth * 16}px` }}
				onClick={() => onSelect(folder.id)}
				onContextMenu={(e) => onContext(e, folder.id)}
				draggable
				onDragStart={(e) => onDragStart(e, folder.id)}
				onDragEnd={onDragEnd}
				onDragOver={(e) => onDragOver(e, folder.id)}
				onDragLeave={onDragLeave}
				onDrop={(e) => onDrop(e, folder.id)}
			>
				{hasChildren ? (
					<button
						onClick={(e) => {
							e.stopPropagation();
							onToggleExpand(folder.id);
						}}
						className="w-5 h-5 flex items-center justify-center -ml-1"
						aria-label={isExpanded ? "collapse" : "expand"}
					>
						<Icon
							name="chevron"
							className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
						/>
					</button>
				) : (
					<span className="w-5" />
				)}
				<Icon
					name={folder.icon}
					className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#FF6B00]" : colorClasses[folder.color]}`}
				/>
				<span className="flex-1 text-sm font-medium truncate">{folder.name}</span>
				{folder.itemCount > 0 && (
					<span className={`text-xs ${isSelected ? "text-[#FF6B00]/80" : "text-white/40"}`}>
						{folder.itemCount}
					</span>
				)}
			</div>
			{isExpanded && hasChildren && (
				<div>
					{folder.children.map((child) => (
						<FolderNode
							key={child.id}
							folder={child}
							depth={depth + 1}
							selected={selected}
							expanded={expanded}
							dragOver={dragOver}
							dragging={dragging}
							creating={creating}
							newName={newName}
							onSelect={onSelect}
							onContext={onContext}
							onToggleExpand={onToggleExpand}
							onDragStart={onDragStart}
							onDragEnd={onDragEnd}
							onDragOver={onDragOver}
							onDragLeave={onDragLeave}
							onDrop={onDrop}
							onNameChange={onNameChange}
							onSaveCreate={onSaveCreate}
							onCancelCreate={onCancelCreate}
							createRef={createRef}
						/>
					))}
				</div>
			)}
			{creating === folder.id && (
				<div
					className="flex items-center gap-1 px-2 py-1.5"
					style={{ paddingLeft: `${24 + depth * 16}px` }}
				>
					<Icon name="folder" className="w-4 h-4 text-white/40" />
					<input
						ref={createRef}
						value={newName}
						onChange={(e) => onNameChange(e.target.value)}
						onBlur={onSaveCreate}
						onKeyDown={handleKeyDown}
						placeholder="folder name"
						className="flex-1 bg-transparent border-b border-white/20 outline-none text-sm text-white placeholder:text-white/30 py-0.5"
					/>
				</div>
			)}
		</div>
	);
}
