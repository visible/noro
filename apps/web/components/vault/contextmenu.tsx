"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import type { FolderIcon } from "@/lib/types";
import type { FolderColor } from "@/lib/folders";

interface Props {
	x: number;
	y: number;
	onRename: () => void;
	onDelete: () => void;
	onNewSubfolder: () => void;
	onColorChange?: (color: FolderColor) => void;
	onIconChange?: (icon: FolderIcon) => void;
}

const colors: FolderColor[] = [
	"default",
	"red",
	"orange",
	"yellow",
	"green",
	"blue",
	"purple",
	"pink",
];

const colorStyles: Record<FolderColor, string> = {
	default: "rgba(255,255,255,0.2)",
	red: "rgb(239,68,68)",
	orange: "rgb(249,115,22)",
	yellow: "rgb(234,179,8)",
	green: "rgb(34,197,94)",
	blue: "rgb(59,130,246)",
	purple: "rgb(168,85,247)",
	pink: "rgb(236,72,153)",
};

export function ContextMenu({
	x,
	y,
	onRename,
	onDelete,
	onNewSubfolder,
	onColorChange,
}: Props) {
	const [showColors, setShowColors] = useState(false);

	return (
		<div
			className="fixed z-50 bg-[#161616] border border-white/10 rounded-lg shadow-xl py-1 min-w-[160px]"
			style={{ left: x, top: y }}
			onClick={(e) => e.stopPropagation()}
		>
			<button
				className="w-full px-3 py-1.5 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white"
				onClick={onNewSubfolder}
			>
				New subfolder
			</button>
			<button
				className="w-full px-3 py-1.5 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white"
				onClick={onRename}
			>
				Rename
			</button>
			{onColorChange && (
				<div className="relative">
					<button
						className="w-full px-3 py-1.5 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white flex items-center justify-between"
						onClick={() => setShowColors(!showColors)}
					>
						Color
						<Icon name="chevron" className="w-3 h-3" />
					</button>
					{showColors && (
						<div className="absolute left-full top-0 ml-1 bg-[#161616] border border-white/10 rounded-lg shadow-xl p-2 flex gap-1">
							{colors.map((color) => (
								<button
									key={color}
									className="w-5 h-5 rounded-full hover:ring-2 ring-white/50"
									style={{ backgroundColor: colorStyles[color] }}
									onClick={() => onColorChange(color)}
								/>
							))}
						</div>
					)}
				</div>
			)}
			<div className="my-1 border-t border-white/10" />
			<button
				className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-white/5 hover:text-red-300"
				onClick={onDelete}
			>
				Delete
			</button>
		</div>
	);
}
