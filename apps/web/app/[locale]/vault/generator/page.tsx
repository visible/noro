"use client";

import { useState, useCallback, useMemo } from "react";
import { strength, type Mode } from "./strength";
import { Icons } from "./icons";
import { Output } from "./output";
import { Settings } from "./settings";
import { History } from "./history";

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

	return (
		<div className="h-full overflow-y-auto scrollbar-hidden">
			<div className="max-w-2xl mx-auto px-6 py-12">
				<header className="mb-10">
					<h1 className="text-2xl font-semibold tracking-tight text-white">Password Generator</h1>
					<p className="mt-2 text-white/50">Generate secure passwords, passphrases, and PINs.</p>
				</header>

				<div className="space-y-6">
					<Output
						password={password}
						copied={copied}
						strengthInfo={strengthInfo}
						onCopy={() => copy(password)}
						onRegenerate={generate}
					/>

					<Settings
						mode={mode}
						length={length}
						uppercase={uppercase}
						lowercase={lowercase}
						numbers={numbers}
						symbols={symbols}
						onModeChange={(m) => {
							setMode(m);
							setLength(m === "diceware" ? 5 : m === "pin" ? 6 : 24);
						}}
						onLengthChange={setLength}
						onUppercaseChange={setUppercase}
						onLowercaseChange={setLowercase}
						onNumbersChange={setNumbers}
						onSymbolsChange={setSymbols}
					/>

					<button
						onClick={generate}
						className="w-full py-3 bg-[#FF6B00] text-white font-medium rounded-xl hover:bg-[#FF6B00]/90 transition-colors"
					>
						Generate Password
					</button>

					<History history={history} onCopy={copy} />
				</div>
			</div>
		</div>
	);
}
