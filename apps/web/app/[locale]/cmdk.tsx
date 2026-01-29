"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";

type Shortcut = {
	keys: string[];
	label: string;
	action: () => void;
};

export function CommandPalette() {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	const isdocs = pathname.includes("/docs");

	const shortcuts: Shortcut[] = useMemo(() => [
		{ keys: ["n"], label: "new secret", action: () => router.push("/share") },
		{ keys: ["d"], label: "docs", action: () => router.push("/docs") },
		{ keys: ["h"], label: "home", action: () => router.push("/") },
		{ keys: ["g"], label: "github", action: () => window.open("https://github.com/visible/noro", "_blank") },
		{ keys: ["esc"], label: "close", action: () => setOpen(false) },
	], [router]);

	const handleKeyDown = useCallback((e: KeyboardEvent) => {
		if ((e.metaKey || e.ctrlKey) && e.key === "k") {
			e.preventDefault();
			setOpen((o) => !o);
			return;
		}

		if (!open) return;

		if (e.key === "Escape") {
			setOpen(false);
			return;
		}

		const shortcut = shortcuts.find((s) => s.keys.includes(e.key.toLowerCase()));
		if (shortcut) {
			e.preventDefault();
			shortcut.action();
			setOpen(false);
		}
	}, [open, shortcuts]);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	if (!open) return null;

	if (isdocs) {
		return (
			<div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh]">
				<div
					className="absolute inset-0 bg-white/60 backdrop-blur-sm"
					onClick={() => setOpen(false)}
				/>
				<div className="relative bg-white border border-black/10 rounded-xl shadow-2xl w-full max-w-xs overflow-hidden">
					<div className="px-4 py-3 border-b border-black/10">
						<span className="text-[10px] tracking-widest text-[#C53D43] uppercase font-medium">shortcuts</span>
					</div>
					<div className="p-2">
						{shortcuts.map((shortcut) => (
							<button
								key={shortcut.label}
								onClick={() => {
									shortcut.action();
									setOpen(false);
								}}
								className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/5 transition-colors group"
							>
								<span className="text-sm text-black/50 group-hover:text-black">{shortcut.label}</span>
								<div className="flex gap-1">
									{shortcut.keys.map((key) => (
										<kbd
											key={key}
											className="px-1.5 py-0.5 text-[10px] font-mono bg-black/5 rounded text-black/40"
										>
											{key}
										</kbd>
									))}
								</div>
							</button>
						))}
					</div>
					<div className="px-4 py-2 border-t border-black/10 flex justify-center">
						<span className="text-[10px] text-black/20">
							<kbd className="px-1 py-0.5 font-mono bg-black/5 rounded">⌘</kbd>
							<span className="mx-1">+</span>
							<kbd className="px-1 py-0.5 font-mono bg-black/5 rounded">k</kbd>
						</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh]">
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={() => setOpen(false)}
			/>
			<div className="relative bg-[#161616] border border-white/10 rounded-xl shadow-2xl w-full max-w-xs overflow-hidden">
				<div className="px-4 py-3 border-b border-white/10">
					<span className="text-[10px] tracking-widest text-white/30 uppercase">shortcuts</span>
				</div>
				<div className="p-2">
					{shortcuts.map((shortcut) => (
						<button
							key={shortcut.label}
							onClick={() => {
								shortcut.action();
								setOpen(false);
							}}
							className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
						>
							<span className="text-sm text-white/70 group-hover:text-white">{shortcut.label}</span>
							<div className="flex gap-1">
								{shortcut.keys.map((key) => (
									<kbd
										key={key}
										className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded text-white/50"
									>
										{key}
									</kbd>
								))}
							</div>
						</button>
					))}
				</div>
				<div className="px-4 py-2 border-t border-white/10 flex justify-center">
					<span className="text-[10px] text-white/20">
						<kbd className="px-1 py-0.5 font-mono bg-white/5 rounded">⌘</kbd>
						<span className="mx-1">+</span>
						<kbd className="px-1 py-0.5 font-mono bg-white/5 rounded">k</kbd>
					</span>
				</div>
			</div>
		</div>
	);
}
