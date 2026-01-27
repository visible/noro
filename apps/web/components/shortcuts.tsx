"use client";

import { useEffect } from "react";

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
	useEffect(() => {
		if (!open) return;
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape" || e.key === "?") {
				e.preventDefault();
				onClose();
			}
		}
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/80" onClick={onClose} />
			<div className="relative bg-stone-900 border border-white/10 rounded-xl w-full max-w-sm mx-4">
				<div className="p-4 border-b border-white/10 flex items-center justify-between">
					<h2 className="text-lg font-semibold">keyboard shortcuts</h2>
					<button onClick={onClose} className="text-white/40 hover:text-white">
						<svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
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
					<p className="text-xs text-white/30 text-center">
						use ctrl instead of ⌘ on windows/linux
					</p>
				</div>
			</div>
		</div>
	);
}
