"use client";

import { useState, useCallback } from "react";

type Mode = "random" | "diceware" | "pin";

export default function Generator() {
	const [password, setPassword] = useState("");
	const [mode, setMode] = useState<Mode>("random");
	const [length, setLength] = useState(24);
	const [uppercase, setUppercase] = useState(true);
	const [lowercase, setLowercase] = useState(true);
	const [numbers, setNumbers] = useState(true);
	const [symbols, setSymbols] = useState(true);
	const [copied, setCopied] = useState(false);

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

		setPassword(result);
		setCopied(false);
	}, [mode, length, uppercase, lowercase, numbers, symbols]);

	async function copy() {
		await navigator.clipboard.writeText(password);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="max-w-xl">
			<h1 className="text-2xl font-bold mb-8">password generator</h1>

			<div className="bg-white/5 rounded-lg p-4 mb-6">
				<div className="flex items-center gap-4">
					<p className="flex-1 font-mono text-lg break-all">{password || "click generate"}</p>
					{password && (
						<button
							onClick={copy}
							className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors shrink-0"
						>
							{copied ? "copied!" : "copy"}
						</button>
					)}
				</div>
			</div>

			<div className="space-y-6">
				<div>
					<label className="block text-sm text-white/60 mb-3">type</label>
					<div className="flex gap-2">
						{(["random", "diceware", "pin"] as Mode[]).map((m) => (
							<button
								key={m}
								onClick={() => setMode(m)}
								className={`px-4 py-2 rounded-lg transition-colors ${
									mode === m ? "bg-[#FF6B00] text-black" : "bg-white/10 hover:bg-white/20"
								}`}
							>
								{m}
							</button>
						))}
					</div>
				</div>

				<div>
					<label className="block text-sm text-white/60 mb-3">
						length: {length}
						{mode === "diceware" && " words"}
					</label>
					<input
						type="range"
						min={mode === "diceware" ? 3 : mode === "pin" ? 4 : 8}
						max={mode === "diceware" ? 10 : mode === "pin" ? 12 : 64}
						value={length}
						onChange={(e) => setLength(Number(e.target.value))}
						className="w-full accent-[#FF6B00]"
					/>
				</div>

				{mode === "random" && (
					<div>
						<label className="block text-sm text-white/60 mb-3">characters</label>
						<div className="flex flex-wrap gap-3">
							{[
								{ label: "ABC", value: uppercase, set: setUppercase },
								{ label: "abc", value: lowercase, set: setLowercase },
								{ label: "123", value: numbers, set: setNumbers },
								{ label: "!@#", value: symbols, set: setSymbols },
							].map((opt) => (
								<button
									key={opt.label}
									onClick={() => opt.set(!opt.value)}
									className={`px-4 py-2 rounded-lg transition-colors ${
										opt.value ? "bg-white/20" : "bg-white/5 text-white/40"
									}`}
								>
									{opt.label}
								</button>
							))}
						</div>
					</div>
				)}

				<button
					onClick={generate}
					className="w-full py-3 bg-[#FF6B00] text-black font-semibold rounded-lg hover:bg-[#FF6B00]/90 transition-colors"
				>
					generate
				</button>
			</div>
		</div>
	);
}
