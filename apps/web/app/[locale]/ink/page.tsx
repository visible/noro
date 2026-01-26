"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Dock } from "@/components/dock";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/languagetoggle";

const BackgroundBeams = dynamic(
	() => import("@/components/background-beams").then((mod) => mod.BackgroundBeams),
	{ ssr: false }
);

type Theme = {
	name: string;
	accent: string;
	bg: string;
	fg: string;
	muted: string;
	colors: string[];
};

const themes: Theme[] = [
	{
		name: "dark",
		accent: "#FF6B00",
		bg: "#0c0a09",
		fg: "#fafaf9",
		muted: "#57534e",
		colors: ["#ef4444", "#22c55e", "#eab308", "#3b82f6", "#a855f7", "#06b6d4"],
	},
	{
		name: "light",
		accent: "#C53D43",
		bg: "#f5f3ef",
		fg: "#1c1917",
		muted: "#a8a29e",
		colors: ["#dc2626", "#16a34a", "#ca8a04", "#2563eb", "#9333ea", "#0891b2"],
	},
	{
		name: "xbox",
		accent: "#107C10",
		bg: "#0e0e0e",
		fg: "#ffffff",
		muted: "#444444",
		colors: ["#D04242", "#3CDB4E", "#ECDB33", "#40CCD0", "#9b59b6", "#40CCD0"],
	},
];

type Download = { name: string; ext: string };

const editors: Download[] = [
	{ name: "vs code", ext: ".json" },
	{ name: "cursor", ext: ".json" },
	{ name: "jetbrains", ext: ".icls" },
];

const terminals: Download[] = [
	{ name: "kitty", ext: ".conf" },
	{ name: "alacritty", ext: ".toml" },
	{ name: "warp", ext: ".yaml" },
	{ name: "windows terminal", ext: "-wt.json" },
];

function XboxLogo({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
			<path d="M4.102 21.033C6.211 22.881 8.977 24 12 24c3.026 0 5.789-1.119 7.902-2.967 1.877-1.912-4.316-8.709-7.902-11.417-3.582 2.708-9.779 9.505-7.898 11.417zm11.16-14.406c2.5 2.961 7.484 10.313 6.076 12.912C23.056 17.36 24 14.795 24 12c0-4.124-2.083-7.761-5.25-9.922-.029.037-2.248 3.178-3.488 4.549zm-6.521 0C7.5 5.188 5.28 2.052 5.25 2.078 2.084 4.239 0 7.876 0 12c0 2.795.944 5.36 2.662 7.539-1.408-2.599 3.576-9.951 6.079-12.912zM12 3.719s2.291-.578 4.676-1.963c-1.453-.686-3.058-1.073-4.758-1.073S8.689 1.07 7.238 1.756C9.623 3.141 12 3.719 12 3.719z" />
		</svg>
	);
}

export default function Ink() {
	const [active, setActive] = useState(0);
	const theme = themes[active];

	const prefix = theme.name === "light" ? "noro-light" : theme.name === "xbox" ? "noro-xbox" : "noro-dark";

	return (
		<BackgroundBeams className="text-white selection:bg-[#FF6B00] selection:text-black">
			<Dock />
			<LanguageToggle />
			<Link href="/" className="fixed bottom-0 right-0 p-8 z-50 hover:opacity-60 transition-opacity">
				<Logo />
			</Link>

			<section className="absolute inset-0 z-10 overflow-y-auto">
				<div className="min-h-dvh px-4 sm:px-8 md:px-16 pr-16 sm:pr-20 md:pr-8 py-20">
					<div className="flex items-center gap-3 mb-8">
						<div className="w-3 h-3 rounded-full" style={{ background: theme.accent }} />
						<span className="text-xs tracking-widest text-white/30 uppercase">themes</span>
					</div>

					<h1 className="text-[12vw] md:text-[8vw] leading-none font-bold tracking-tighter mb-4">
						ink
					</h1>
					<p className="text-[3.5vw] md:text-[1.5vw] text-white/60 mb-16 max-w-xl">
						noro themes for your editor and terminal
					</p>

					<div className="flex gap-4 mb-16">
						{themes.map((t, i) => (
							<button
								key={t.name}
								onClick={() => setActive(i)}
								className="group relative px-6 py-3 rounded-lg transition-all"
								style={{
									background: active === i ? t.accent : "transparent",
									border: active === i ? "none" : "1px solid rgba(255,255,255,0.1)",
								}}
							>
								<span
									className="text-sm font-medium tracking-widest uppercase flex items-center gap-2"
									style={{ color: active === i ? (t.name === "light" ? "#fff" : "#000") : "rgba(255,255,255,0.4)" }}
								>
									{t.name === "xbox" && <XboxLogo className="w-4 h-4" />}
									{t.name}
								</span>
							</button>
						))}
					</div>

					<div className="mb-16">
						<div className="flex gap-2 mb-4">
							{theme.colors.map((color, i) => (
								<div
									key={i}
									className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-transform hover:scale-110"
									style={{ background: color }}
								/>
							))}
						</div>
						<div
							className="p-6 rounded-xl font-mono text-sm max-w-lg"
							style={{ background: theme.bg, color: theme.fg }}
						>
							<span style={{ color: theme.muted }}>{"// noro"}</span>
							<br />
							<span style={{ color: theme.accent }}>const</span>
							<span> secret </span>
							<span style={{ color: theme.muted }}>=</span>
							<span style={{ color: theme.colors[0] }}> encrypt</span>
							<span style={{ color: theme.muted }}>(</span>
							<span style={{ color: theme.muted }}>data</span>
							<span style={{ color: theme.muted }}>)</span>
						</div>
					</div>

					<div className="grid sm:grid-cols-2 gap-12 max-w-2xl">
						<div>
							<h2 className="text-xs tracking-widest text-white/30 uppercase mb-4">editors</h2>
							<div className="space-y-2">
								{editors.map((d) => (
									<a
										key={d.name}
										href={`/themes/${prefix}${d.ext}`}
										download
										className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
									>
										<span className="text-sm text-white/70 group-hover:text-white">{d.name}</span>
										<span className="text-xs text-white/30 font-mono">{d.ext}</span>
									</a>
								))}
							</div>
						</div>
						<div>
							<h2 className="text-xs tracking-widest text-white/30 uppercase mb-4">terminals</h2>
							<div className="space-y-2">
								{terminals.map((d) => (
									<a
										key={d.name}
										href={`/themes/${prefix}${d.ext}`}
										download
										className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
									>
										<span className="text-sm text-white/70 group-hover:text-white">{d.name}</span>
										<span className="text-xs text-white/30 font-mono">{d.ext}</span>
									</a>
								))}
							</div>
						</div>
					</div>

					<div className="mt-12 max-w-2xl">
						<h2 className="text-xs tracking-widest text-white/30 uppercase mb-4">streaming</h2>
						<a
							href={`https://gamepadviewer.com/?p=1&s=1&editcss=https://noro.sh/themes/noro-gamepad.css`}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
						>
							<span className="text-sm text-white/70 group-hover:text-white flex items-center gap-2">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
									<rect x="2" y="6" width="20" height="12" rx="2" />
									<circle cx="8" cy="12" r="2" />
									<path d="M15 9h2M15 15h2M18 12h-4" />
								</svg>
								gamepad viewer
							</span>
							<span className="text-xs text-white/30">obs overlay</span>
						</a>
						<p className="mt-3 text-xs text-white/20">
							add as browser source in obs. controller hides when disconnected.
						</p>
					</div>

					<div className="mt-20 text-white/20 text-xs">
						<kbd className="px-2 py-1 font-mono bg-white/5 rounded">⌘</kbd>
						<span className="mx-2">+</span>
						<kbd className="px-2 py-1 font-mono bg-white/5 rounded">k</kbd>
						<span className="ml-3">then</span>
						<kbd className="ml-3 px-2 py-1 font-mono bg-white/5 rounded">i</kbd>
					</div>
				</div>
			</section>
		</BackgroundBeams>
	);
}
