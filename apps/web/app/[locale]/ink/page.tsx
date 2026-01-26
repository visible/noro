"use client";

import { useState } from "react";

const dark = {
	name: "noro dark",
	bg: "#0c0a09",
	fg: "#fafaf9",
	accent: "#ff6b00",
	muted: "#57534e",
	surface: "#1c1917",
	colors: ["#ef4444", "#22c55e", "#eab308", "#3b82f6", "#a855f7", "#06b6d4"],
};

const light = {
	name: "noro light",
	bg: "#f5f3ef",
	fg: "#1c1917",
	accent: "#c53d43",
	muted: "#a8a29e",
	surface: "#ebe8e3",
	colors: ["#dc2626", "#16a34a", "#ca8a04", "#2563eb", "#9333ea", "#0891b2"],
};

type Theme = typeof dark;

interface Download {
	name: string;
	file: string;
	icon: React.ReactNode;
}

const editors: Download[] = [
	{ name: "vs code", file: ".json", icon: <CodeIcon /> },
	{ name: "cursor", file: ".json", icon: <CodeIcon /> },
	{ name: "jetbrains", file: ".icls", icon: <BrainIcon /> },
];

const terminals: Download[] = [
	{ name: "kitty", file: ".conf", icon: <TerminalIcon /> },
	{ name: "alacritty", file: ".toml", icon: <TerminalIcon /> },
	{ name: "warp", file: ".yaml", icon: <TerminalIcon /> },
	{ name: "windows terminal", file: "-wt.json", icon: <TerminalIcon /> },
];

function CodeIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
			<polyline points="16 18 22 12 16 6" />
			<polyline points="8 6 2 12 8 18" />
		</svg>
	);
}

function BrainIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
			<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
			<path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
			<path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
			<path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
			<path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
			<path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
			<path d="M19.938 10.5a4 4 0 0 1 .585.396" />
			<path d="M6 18a4 4 0 0 1-1.967-.516" />
			<path d="M19.967 17.484A4 4 0 0 1 18 18" />
		</svg>
	);
}

function TerminalIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
			<polyline points="4 17 10 11 4 5" />
			<line x1="12" x2="20" y1="19" y2="19" />
		</svg>
	);
}

function DownloadIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="7 10 12 15 17 10" />
			<line x1="12" x2="12" y1="15" y2="3" />
		</svg>
	);
}

function Palette({ theme, active }: { theme: Theme; active: boolean }) {
	return (
		<div
			className="relative rounded-2xl p-6 transition-all duration-300"
			style={{
				background: theme.bg,
				border: active ? `2px solid ${theme.accent}` : "2px solid transparent",
				boxShadow: active ? `0 0 40px ${theme.accent}20` : "none",
			}}
		>
			<div className="flex items-center gap-3 mb-6">
				<div className="w-3 h-3 rounded-full" style={{ background: theme.accent }} />
				<span className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.muted }}>
					{theme.name}
				</span>
			</div>

			<div className="space-y-3 mb-6">
				<div className="flex gap-2">
					<div className="w-12 h-12 rounded-xl" style={{ background: theme.bg, border: `1px solid ${theme.muted}30` }} />
					<div className="w-12 h-12 rounded-xl" style={{ background: theme.surface }} />
					<div className="w-12 h-12 rounded-xl" style={{ background: theme.accent }} />
				</div>
				<div className="flex gap-2">
					{theme.colors.map((color, i) => (
						<div key={i} className="w-8 h-8 rounded-lg" style={{ background: color }} />
					))}
				</div>
			</div>

			<div className="font-mono text-xs p-4 rounded-xl" style={{ background: theme.surface }}>
				<span style={{ color: theme.muted }}>{"// noro"}</span>
				<br />
				<span style={{ color: theme.accent }}>const</span>
				<span style={{ color: theme.fg }}> secret </span>
				<span style={{ color: theme.muted }}>=</span>
				<span style={{ color: theme.colors[0] }}> encrypt</span>
				<span style={{ color: theme.muted }}>(</span>
				<span style={{ color: theme.muted }}>data</span>
				<span style={{ color: theme.muted }}>)</span>
			</div>
		</div>
	);
}

function Downloads({ theme, downloads, label }: { theme: Theme; downloads: Download[]; label: string }) {
	const prefix = theme === dark ? "noro-dark" : "noro-light";

	return (
		<div>
			<h3 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: theme.muted }}>
				{label}
			</h3>
			<div className="space-y-2">
				{downloads.map((d) => (
					<a
						key={d.name}
						href={`/themes/${prefix}${d.file}`}
						download
						className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
						style={{ background: theme.surface }}
						onMouseEnter={(e) => (e.currentTarget.style.background = theme.accent + "20")}
						onMouseLeave={(e) => (e.currentTarget.style.background = theme.surface)}
					>
						<span style={{ color: theme.muted }}>{d.icon}</span>
						<span className="flex-1 text-sm" style={{ color: theme.fg }}>
							{d.name}
						</span>
						<span className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: theme.accent }}>
							<DownloadIcon />
						</span>
					</a>
				))}
			</div>
		</div>
	);
}

export default function Ink() {
	const [active, setActive] = useState<"dark" | "light">("dark");
	const theme = active === "dark" ? dark : light;

	return (
		<main
			className="min-h-screen transition-colors duration-500"
			style={{ background: theme.bg }}
		>
			<div className="max-w-4xl mx-auto px-6 py-20">
				<header className="text-center mb-16">
					<div className="inline-flex items-center gap-2 mb-6">
						<svg width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} aria-hidden="true">
							<rect width="24" height="24" rx="6" fill={theme.accent} />
							<path
								fill={theme.bg}
								d="M17.5,3.875 C19.7782,3.875 21.625,5.72183 21.625,8 C21.625,9.2471 21.0714,10.36501 20.1971,11.12122 C20.4748,11.86972 20.625,12.66939 20.625,13.5 C20.625,15.89 19.382,18.0188 17.4446,19.4143 C17.1624,19.6176 16.8653,19.8054 16.5551,19.9763 L16.5183,19.9964 C15.2037,20.7125 13.6559,21.125 12,21.125 C10.34411,21.125 8.79628,20.7124 7.48166,19.9964 C7.1745,19.8291 6.88004,19.6452 6.59991,19.4462 L6.55539,19.4143 C4.61803,18.0188 3.375,15.89 3.375,13.5 C3.375,12.66939 3.52525,11.86971 3.80294,11.12122 C2.92856,10.36501 2.375,9.2471 2.375,8 C2.375,5.72183 4.22183,3.875 6.5,3.875 C8.07432,3.875 9.44244,4.75696 10.1376,6.05321 C10.73749,5.9365 11.36069,5.875 12,5.875 C12.6393,5.875 13.2625,5.9365 13.8624,6.05321 C14.5576,4.75696 15.9257,3.875 17.5,3.875 Z"
							/>
						</svg>
					</div>
					<h1 className="text-4xl font-bold tracking-tight mb-4" style={{ color: theme.fg }}>
						ink
					</h1>
					<p className="text-lg" style={{ color: theme.muted }}>
						noro themes for your editor and terminal
					</p>
				</header>

				<div className="flex justify-center gap-2 mb-12">
					<button
						onClick={() => setActive("dark")}
						className="px-6 py-3 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-200"
						style={{
							background: active === "dark" ? dark.accent : "transparent",
							color: active === "dark" ? "#000" : theme.muted,
							border: active === "dark" ? "none" : `1px solid ${theme.muted}30`,
						}}
					>
						dark
					</button>
					<button
						onClick={() => setActive("light")}
						className="px-6 py-3 rounded-xl text-sm font-bold tracking-widest uppercase transition-all duration-200"
						style={{
							background: active === "light" ? light.accent : "transparent",
							color: active === "light" ? "#fff" : theme.muted,
							border: active === "light" ? "none" : `1px solid ${theme.muted}30`,
						}}
					>
						light
					</button>
				</div>

				<div className="grid md:grid-cols-2 gap-8 mb-16">
					<Palette theme={dark} active={active === "dark"} />
					<Palette theme={light} active={active === "light"} />
				</div>

				<div className="grid md:grid-cols-2 gap-12">
					<Downloads theme={theme} downloads={editors} label="editors" />
					<Downloads theme={theme} downloads={terminals} label="terminals" />
				</div>

				<footer className="text-center mt-20">
					<a
						href="/"
						className="text-sm transition-colors"
						style={{ color: theme.muted }}
						onMouseEnter={(e) => (e.currentTarget.style.color = theme.accent)}
						onMouseLeave={(e) => (e.currentTarget.style.color = theme.muted)}
					>
						noro.sh
					</a>
				</footer>
			</div>
		</main>
	);
}
