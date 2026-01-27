"use client";

import { useState, useCallback, useMemo } from "react";

type Mode = "random" | "diceware" | "pin";

function strength(password: string, mode: Mode): { label: string; color: string; width: string } {
	if (!password) return { label: "none", color: "bg-black/10", width: "w-0" };

	if (mode === "pin") {
		if (password.length >= 8) return { label: "strong", color: "bg-emerald-500", width: "w-full" };
		if (password.length >= 6) return { label: "good", color: "bg-amber-500", width: "w-2/3" };
		return { label: "weak", color: "bg-red-500", width: "w-1/3" };
	}

	if (mode === "diceware") {
		const words = password.split("-").length;
		if (words >= 6) return { label: "strong", color: "bg-emerald-500", width: "w-full" };
		if (words >= 4) return { label: "good", color: "bg-amber-500", width: "w-2/3" };
		return { label: "weak", color: "bg-red-500", width: "w-1/3" };
	}

	let score = 0;
	if (password.length >= 16) score++;
	if (password.length >= 24) score++;
	if (/[A-Z]/.test(password)) score++;
	if (/[a-z]/.test(password)) score++;
	if (/[0-9]/.test(password)) score++;
	if (/[^A-Za-z0-9]/.test(password)) score++;

	if (score >= 5) return { label: "strong", color: "bg-emerald-500", width: "w-full" };
	if (score >= 3) return { label: "good", color: "bg-amber-500", width: "w-2/3" };
	return { label: "weak", color: "bg-red-500", width: "w-1/3" };
}

const copyIcon = (
	<svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
		<path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" stroke="currentColor" strokeWidth="1.5" />
	</svg>
);

const checkIcon = (
	<svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<path d="M3 8l4 4 6-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const refreshIcon = (
	<svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<path d="M2 8a6 6 0 1011.5 2.5M14 4v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export default function Generator() {
	const [password, setPassword] = useState("");
	const [mode, setMode] = useState<Mode>("random");
	const [length, setLength] = useState(24);
	const [uppercase, setUppercase] = useState(true);
	const [lowercase, setLowercase] = useState(true);
	const [numbers, setNumbers] = useState(true);
	const [symbols, setSymbols] = useState(true);
	const [copied, setCopied] = useState(false);
	const [history, setHistory] = useState<string[]>([]);

	const generate = useCallback(() => {
		let result = "";

		if (mode === "random") {
			let chars = "";
			if (uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			if (lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
			if (numbers) chars += "0123456789";
			if (symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

			if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";

			const bytes = crypto.getRandomValues(new Uint8Array(length));
			for (let i = 0; i < length; i++) {
				result += chars[bytes[i] % chars.length];
			}
		} else if (mode === "diceware") {
			const words = [
				"apple", "banana", "cherry", "dragon", "eagle", "forest", "guitar", "harbor",
				"island", "jungle", "kitchen", "lemon", "mountain", "north", "ocean", "piano",
				"quantum", "river", "sunset", "thunder", "umbrella", "violet", "window", "yellow",
				"zebra", "anchor", "bridge", "castle", "dolphin", "engine", "falcon", "garden",
			];
			const bytes = crypto.getRandomValues(new Uint8Array(6));
			const selected = Array.from(bytes)
				.slice(0, Math.ceil(length / 4))
				.map((b) => words[b % words.length]);
			result = selected.join("-");
		} else if (mode === "pin") {
			const bytes = crypto.getRandomValues(new Uint8Array(length));
			for (let i = 0; i < length; i++) {
				result += (bytes[i] % 10).toString();
			}
		}

		if (password && !history.includes(password)) {
			setHistory((prev) => [password, ...prev].slice(0, 5));
		}
		setPassword(result);
		setCopied(false);
	}, [mode, length, uppercase, lowercase, numbers, symbols, password, history]);

	async function copy(text: string) {
		await navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	const strengthInfo = useMemo(() => strength(password, mode), [password, mode]);

	const minLength = mode === "diceware" ? 3 : mode === "pin" ? 4 : 8;
	const maxLength = mode === "diceware" ? 10 : mode === "pin" ? 12 : 64;

	return (
		<div className="max-w-2xl mx-auto">
			<div className="mb-8">
				<h1 className="text-2xl font-semibold tracking-tight text-white mb-2">Password Generator</h1>
				<p className="text-white/50">Generate secure passwords, passphrases, and PINs.</p>
			</div>

			<div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
				<div className="flex items-start gap-4 mb-4">
					<p className="flex-1 font-mono text-lg break-all text-white min-h-[56px] flex items-center">
						{password || <span className="text-white/30">click generate to create a password</span>}
					</p>
					{password && (
						<div className="flex gap-2 shrink-0">
							<button
								onClick={() => copy(password)}
								className={`p-3 rounded-lg transition-colors ${
									copied
										? "bg-emerald-500/20 text-emerald-400"
										: "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
								}`}
								title="Copy password"
							>
								{copied ? checkIcon : copyIcon}
							</button>
							<button
								onClick={generate}
								className="p-3 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
								title="Regenerate"
							>
								{refreshIcon}
							</button>
						</div>
					)}
				</div>

				{password && (
					<div className="space-y-2">
						<div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
							<div className={`h-full ${strengthInfo.color} ${strengthInfo.width} transition-all duration-300`} />
						</div>
						<p className="text-xs text-white/40">
							strength: <span className={strengthInfo.label === "strong" ? "text-emerald-400" : strengthInfo.label === "good" ? "text-amber-400" : "text-red-400"}>{strengthInfo.label}</span>
						</p>
					</div>
				)}
			</div>

			<div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
				<h2 className="text-sm font-medium text-white/80 mb-4">Settings</h2>

				<div className="space-y-6">
					<div>
						<label className="block text-sm text-white/50 mb-3">Type</label>
						<div className="flex gap-2">
							{(["random", "diceware", "pin"] as Mode[]).map((m) => (
								<button
									key={m}
									onClick={() => {
										setMode(m);
										setLength(m === "diceware" ? 5 : m === "pin" ? 6 : 24);
									}}
									className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
										mode === m
											? "bg-[#FF6B00] text-white"
											: "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
									}`}
								>
									{m}
								</button>
							))}
						</div>
					</div>

					<div>
						<div className="flex items-center justify-between mb-3">
							<label className="text-sm text-white/50">
								Length{mode === "diceware" && " (words)"}
							</label>
							<span className="text-sm font-mono text-white/80 bg-white/5 px-2 py-1 rounded">
								{length}
							</span>
						</div>
						<input
							type="range"
							min={minLength}
							max={maxLength}
							value={length}
							onChange={(e) => setLength(Number(e.target.value))}
							className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
						/>
						<div className="flex justify-between mt-1.5">
							<span className="text-xs text-white/30">{minLength}</span>
							<span className="text-xs text-white/30">{maxLength}</span>
						</div>
					</div>

					{mode === "random" && (
						<div>
							<label className="block text-sm text-white/50 mb-3">Include</label>
							<div className="grid grid-cols-2 gap-3">
								{[
									{ key: "uppercase", label: "Uppercase (A-Z)", value: uppercase, set: setUppercase },
									{ key: "lowercase", label: "Lowercase (a-z)", value: lowercase, set: setLowercase },
									{ key: "numbers", label: "Numbers (0-9)", value: numbers, set: setNumbers },
									{ key: "symbols", label: "Symbols (!@#)", value: symbols, set: setSymbols },
								].map((opt) => (
									<label
										key={opt.key}
										className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
											opt.value
												? "bg-white/10 border border-white/20"
												: "bg-white/5 border border-transparent hover:bg-white/10"
										}`}
									>
										<div
											className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
												opt.value ? "bg-white" : "bg-white/10"
											}`}
										>
											{opt.value && (
												<svg className="w-3 h-3 text-stone-900" viewBox="0 0 16 16" fill="none" aria-hidden="true">
													<path d="M3 8l4 4 6-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
												</svg>
											)}
										</div>
										<input
											type="checkbox"
											checked={opt.value}
											onChange={() => opt.set(!opt.value)}
											className="sr-only"
										/>
										<span className="text-sm text-white/80">{opt.label}</span>
									</label>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			<button
				onClick={generate}
				className="w-full py-3.5 bg-[#FF6B00] text-white font-semibold rounded-xl hover:bg-[#FF6B00]/90 transition-colors"
			>
				Generate Password
			</button>

			{history.length > 0 && (
				<div className="mt-8">
					<h2 className="text-sm font-medium text-white/50 mb-4">Recent</h2>
					<div className="space-y-2">
						{history.map((pw, i) => (
							<div
								key={i}
								className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg group"
							>
								<p className="flex-1 font-mono text-sm text-white/60 truncate">{pw}</p>
								<button
									onClick={() => copy(pw)}
									className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
									title="Copy"
								>
									{copyIcon}
								</button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
