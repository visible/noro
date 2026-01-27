"use client";

import { useEffect, useCallback } from "react";

type ShortcutKey = "k" | "n" | "g" | "," | "c" | "Escape" | "?";

type ShortcutHandlers = {
	search?: () => void;
	new?: () => void;
	generator?: () => void;
	settings?: () => void;
	escape?: () => void;
	copy?: () => void;
	help?: () => void;
};

const modifierKeys: ShortcutKey[] = ["k", "n", "g", ",", "c"];

export function useShortcuts(handlers: ShortcutHandlers) {
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

			if (e.key === "?" && !isInput && handlers.help) {
				e.preventDefault();
				handlers.help();
				return;
			}

			if (e.key === "Escape" && handlers.escape) {
				e.preventDefault();
				handlers.escape();
				return;
			}

			if (!(e.metaKey || e.ctrlKey)) return;

			const key = e.key.toLowerCase() as ShortcutKey;

			if (!modifierKeys.includes(key)) return;

			switch (key) {
				case "k":
					if (handlers.search) {
						e.preventDefault();
						handlers.search();
					}
					break;
				case "n":
					if (handlers.new) {
						e.preventDefault();
						handlers.new();
					}
					break;
				case "g":
					if (handlers.generator) {
						e.preventDefault();
						handlers.generator();
					}
					break;
				case ",":
					if (handlers.settings) {
						e.preventDefault();
						handlers.settings();
					}
					break;
				case "c":
					if (handlers.copy && !isInput) {
						e.preventDefault();
						handlers.copy();
					}
					break;
			}
		},
		[handlers]
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);
}
