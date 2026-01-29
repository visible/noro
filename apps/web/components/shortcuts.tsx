"use client";

import { Modal, ModalHeader } from "@/components/ui/modal";

interface Props {
	open: boolean;
	onClose: () => void;
}

const shortcuts = [
	{ keys: ["cmd", "k"], label: "search" },
	{ keys: ["cmd", "n"], label: "new item" },
	{ keys: ["cmd", "g"], label: "generator" },
	{ keys: ["cmd", ","], label: "settings" },
	{ keys: ["cmd", "c"], label: "copy password" },
	{ keys: ["esc"], label: "close modal" },
	{ keys: ["?"], label: "show shortcuts" },
];

export function Shortcuts({ open, onClose }: Props) {
	return (
		<Modal open={open} onClose={onClose}>
			<ModalHeader onClose={onClose}>keyboard shortcuts</ModalHeader>
			<div className="p-2">
				{shortcuts.map((s) => (
					<div key={s.label} className="flex items-center justify-between px-3 py-2.5">
						<span className="text-sm text-white/70">{s.label}</span>
						<div className="flex gap-1">
							{s.keys.map((key) => (
								<kbd
									key={key}
									className="px-2 py-1 text-xs font-mono bg-white/10 rounded text-white/50 min-w-[24px] text-center"
								>
									{key === "cmd" ? "⌘" : key}
								</kbd>
							))}
						</div>
					</div>
				))}
			</div>
			<div className="p-3 border-t border-white/10">
				<p className="text-xs text-white/30 text-center">use ctrl instead of ⌘ on windows/linux</p>
			</div>
		</Modal>
	);
}
