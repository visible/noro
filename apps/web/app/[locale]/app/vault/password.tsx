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
					className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-24 focus:outline-none focus:border-[#FF6B00] transition-colors font-mono text-sm read-only:opacity-60"
				/>
				<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
					{showGenerator && !readOnly && (
						<button
							type="button"
							onClick={() => setGeneratorOpen(!generatorOpen)}
							className="text-white/40 hover:text-white"
							title="generate password"
						>
							<svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
						</button>
					)}
					<button
						type="button"
						onClick={() => setShow(!show)}
						className="text-white/40 hover:text-white text-sm"
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
