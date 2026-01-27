"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
	value: string;
	label: string;
}

interface SelectProps {
	label?: string;
	error?: string;
	options: Option[];
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
	disabled?: boolean;
	className?: string;
}

export function Select({ label, error, options, placeholder, value, onChange, disabled, className = "" }: SelectProps) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const selected = options.find((o) => o.value === value);

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	return (
		<div className={`w-full ${className}`}>
			{label && (
				<label className="block text-sm font-medium text-white/80 mb-1.5">
					{label}
				</label>
			)}
			<div ref={ref} className="relative">
				<button
					type="button"
					onClick={() => !disabled && setOpen(!open)}
					disabled={disabled}
					className={`
						w-full px-3 py-2.5 rounded-lg border bg-white/5
						text-sm text-left flex items-center justify-between gap-2
						transition-all duration-150
						${error ? "border-red-500" : "border-white/10 hover:bg-white/10"}
						${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
					`}
				>
					<span className={selected ? "text-white" : "text-white/40"}>
						{selected?.label || placeholder || "select..."}
					</span>
					<svg
						aria-hidden="true"
						className={`w-4 h-4 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
					</svg>
				</button>
				{open && (
					<div className="absolute left-0 right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 py-1 max-h-48 overflow-y-auto scrollbar-hidden">
						{options.map((opt) => (
							<button
								key={opt.value}
								type="button"
								onClick={() => { onChange?.(opt.value); setOpen(false); }}
								className={`w-full px-3 py-2 text-left text-sm transition-colors ${
									opt.value === value ? "bg-[#FF6B00] text-white" : "text-white/80 hover:bg-white/5"
								}`}
							>
								{opt.label}
							</button>
						))}
					</div>
				)}
			</div>
			{error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
		</div>
	);
}
