"use client";

import { useState, useRef, useEffect } from "react";
import { Generator } from "@/components/generator";

interface Props {
	value: string;
	onChange: (value: string) => void;
	required?: boolean;
	readOnly?: boolean;
	showGenerator?: boolean;
}

export function PasswordField({ value, onChange, required, readOnly, showGenerator }: Props) {
	const [show, setShow] = useState(false);
	const [generatorOpen, setGeneratorOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setGeneratorOpen(false);
			}
		}
		if (generatorOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [generatorOpen]);

	function handleSelect(password: string) {
		onChange(password);
		setGeneratorOpen(false);
	}

	return (
		<div className="relative" ref={dropdownRef}>
			<div className="relative">
				<input
					type={show ? "text" : "password"}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					required={required}
					readOnly={readOnly}
					className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 min-h-[48px] pr-28 focus:outline-none focus:border-[#FF6B00] transition-colors font-mono text-base read-only:opacity-60"
				/>
				<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
					{showGenerator && !readOnly && (
						<button
							type="button"
							onClick={() => setGeneratorOpen(!generatorOpen)}
							className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white rounded-lg"
							title="generate password"
							aria-label="generate password"
						>
							<svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
						</button>
					)}
					<button
						type="button"
						onClick={() => setShow(!show)}
						className="px-2 h-10 flex items-center text-white/40 hover:text-white text-sm rounded-lg"
					>
						{show ? "hide" : "show"}
					</button>
				</div>
			</div>
			{generatorOpen && (
				<div className="absolute z-50 mt-2 left-0 right-0 bg-stone-800 border border-white/10 rounded-lg p-4 shadow-xl">
					<Generator onSelect={handleSelect} compact />
				</div>
			)}
		</div>
	);
}

export function PasswordFieldLight({ value, onChange, required, readOnly, showGenerator }: Props) {
	const [show, setShow] = useState(false);
	const [generatorOpen, setGeneratorOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setGeneratorOpen(false);
			}
		}
		if (generatorOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [generatorOpen]);

	function handleSelect(password: string) {
		onChange(password);
		setGeneratorOpen(false);
	}

	return (
		<div className="relative" ref={dropdownRef}>
			<div className="relative">
				<input
					type={show ? "text" : "password"}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					required={required}
					readOnly={readOnly}
					className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 pr-28 text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all font-mono read-only:bg-stone-50 read-only:text-stone-500"
				/>
				<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
					{showGenerator && !readOnly && (
						<button
							type="button"
							onClick={() => setGeneratorOpen(!generatorOpen)}
							className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
							title="generate password"
							aria-label="generate password"
						>
							<svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
						</button>
					)}
					<button
						type="button"
						onClick={() => setShow(!show)}
						className="px-2 h-9 flex items-center text-xs font-medium text-stone-500 hover:text-stone-700 transition-colors rounded-lg"
					>
						{show ? "hide" : "show"}
					</button>
				</div>
			</div>
			{generatorOpen && (
				<div className="absolute z-50 mt-2 left-0 right-0 bg-white border border-stone-200 rounded-xl p-4 shadow-lg">
					<GeneratorLight onSelect={handleSelect} />
				</div>
			)}
		</div>
	);
}

interface GeneratorProps {
	onSelect: (password: string) => void;
}

function GeneratorLight({ onSelect }: GeneratorProps) {
	const [password, setPassword] = useState("");
	const [length, setLength] = useState(24);
	const [uppercase, setUppercase] = useState(true);
	const [lowercase, setLowercase] = useState(true);
	const [numbers, setNumbers] = useState(true);
	const [symbols, setSymbols] = useState(true);
	const [copied, setCopied] = useState(false);

	const chars = {
		uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		lowercase: "abcdefghijklmnopqrstuvwxyz",
		numbers: "0123456789",
		symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
	};

	function generate() {
		let pool = "";
		if (uppercase) pool += chars.uppercase;
		if (lowercase) pool += chars.lowercase;
		if (numbers) pool += chars.numbers;
		if (symbols) pool += chars.symbols;
		if (!pool) pool = chars.lowercase;
		const bytes = crypto.getRandomValues(new Uint8Array(length));
		let result = "";
		for (let i = 0; i < length; i++) {
			result += pool[bytes[i] % pool.length];
		}
		setPassword(result);
		setCopied(false);
	}

	useEffect(() => {
		generate();
	}, [length, uppercase, lowercase, numbers, symbols]);

	async function copy() {
		await navigator.clipboard.writeText(password);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="space-y-4">
			<div className="bg-stone-50 rounded-lg p-3">
				<p className="font-mono text-sm text-stone-900 break-all min-h-[20px]">{password}</p>
			</div>

			<div className="flex gap-2">
				<button
					type="button"
					onClick={copy}
					className="px-3.5 py-2.5 text-sm font-medium text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 active:bg-stone-300 transition-colors"
				>
					{copied ? "copied" : "copy"}
				</button>
				<button
					type="button"
					onClick={generate}
					className="px-3.5 py-2.5 text-sm font-medium text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 active:bg-stone-300 transition-colors"
				>
					regenerate
				</button>
				<button
					type="button"
					onClick={() => onSelect(password)}
					className="px-3.5 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 active:bg-orange-700 transition-colors"
				>
					use
				</button>
			</div>

			<div>
				<div className="flex justify-between text-sm mb-2">
					<span className="text-stone-600">length</span>
					<span className="font-medium text-stone-900">{length}</span>
				</div>
				<input
					type="range"
					min={8}
					max={128}
					value={length}
					onChange={(e) => setLength(Number(e.target.value))}
					className="w-full accent-orange-500"
				/>
			</div>

			<div className="flex flex-wrap gap-2">
				{[
					{ label: "ABC", value: uppercase, set: setUppercase },
					{ label: "abc", value: lowercase, set: setLowercase },
					{ label: "123", value: numbers, set: setNumbers },
					{ label: "!@#", value: symbols, set: setSymbols },
				].map((opt) => (
					<button
						key={opt.label}
						type="button"
						onClick={() => opt.set(!opt.value)}
						className={`px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
							opt.value ? "bg-stone-200 text-stone-900" : "bg-stone-100 text-stone-400"
						}`}
					>
						{opt.label}
					</button>
				))}
			</div>
		</div>
	);
}
