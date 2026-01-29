"use client";

import { useState, KeyboardEvent } from "react";

interface TagFilterProps {
	tags: string[];
	selected: string | null;
	onSelect: (tag: string | null) => void;
}

export function TagFilter({ tags, selected, onSelect }: TagFilterProps) {
	if (tags.length === 0) return null;

	return (
		<div className="flex gap-1.5 flex-wrap items-center">
			<svg aria-hidden="true" className="w-3.5 h-3.5 text-white/30 shrink-0 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6h.008v.008H6V6z" />
			</svg>
			{selected && (
				<button
					onClick={() => onSelect(null)}
					className="px-2 py-1 text-xs text-white/40 hover:text-white/50 transition-colors"
				>
					clear
				</button>
			)}
			{tags.map((tag) => {
				const isActive = selected === tag;
				return (
					<button
						key={tag}
						onClick={() => onSelect(isActive ? null : tag)}
						className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
							isActive
								? "bg-[#d4b08c]/10 text-[#d4b08c] border border-[#d4b08c]/20"
								: "bg-white/10 text-white/50 border border-transparent hover:text-white/60"
						}`}
					>
						{tag}
					</button>
				);
			})}
		</div>
	);
}

interface TagInputProps {
	tags: string[];
	onChange: (tags: string[]) => void;
	readOnly?: boolean;
}

export function TagInput({ tags, onChange, readOnly }: TagInputProps) {
	const [input, setInput] = useState("");

	function addTag(value: string) {
		const tag = value.trim().toLowerCase();
		if (tag && !tags.includes(tag)) {
			onChange([...tags, tag]);
		}
		setInput("");
	}

	function removeTag(tag: string) {
		onChange(tags.filter((t) => t !== tag));
	}

	function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addTag(input);
		} else if (e.key === "Backspace" && !input && tags.length > 0) {
			removeTag(tags[tags.length - 1]);
		}
	}

	return (
		<div className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 min-h-[48px] focus-within:ring-2 focus-within:ring-[#d4b08c]/40 focus-within:border-[#d4b08c] transition-all">
			<div className="flex flex-wrap gap-2 items-center">
				{tags.map((tag) => (
					<span
						key={tag}
						className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-full text-sm text-white/70"
					>
						{tag}
						{!readOnly && (
							<button
								type="button"
								onClick={() => removeTag(tag)}
								className="w-5 h-5 flex items-center justify-center text-white/40 hover:text-white transition-colors rounded"
								aria-label={`remove ${tag}`}
							>
								<svg aria-hidden="true" className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						)}
					</span>
				))}
				{!readOnly && (
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						onBlur={() => input && addTag(input)}
						placeholder={tags.length === 0 ? "add tags..." : ""}
						className="flex-1 min-w-[100px] bg-transparent outline-none text-base text-white placeholder:text-white/40 py-1"
					/>
				)}
			</div>
		</div>
	);
}

export function TagInputLight({ tags, onChange, readOnly }: TagInputProps) {
	const [input, setInput] = useState("");

	function addTag(value: string) {
		const tag = value.trim().toLowerCase();
		if (tag && !tags.includes(tag)) {
			onChange([...tags, tag]);
		}
		setInput("");
	}

	function removeTag(tag: string) {
		onChange(tags.filter((t) => t !== tag));
	}

	function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addTag(input);
		} else if (e.key === "Backspace" && !input && tags.length > 0) {
			removeTag(tags[tags.length - 1]);
		}
	}

	return (
		<div className="w-full bg-[#161616] border border-white/10 rounded-xl px-3 py-2.5 min-h-[48px] focus-within:ring-2 focus-within:ring-[#d4b08c]/40 focus-within:border-[#d4b08c] transition-all">
			<div className="flex flex-wrap gap-2 items-center">
				{tags.map((tag) => (
					<span
						key={tag}
						className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-full text-sm text-white/70"
					>
						{tag}
						{!readOnly && (
							<button
								type="button"
								onClick={() => removeTag(tag)}
								className="w-5 h-5 flex items-center justify-center text-white/30 hover:text-white/50 transition-colors rounded"
								aria-label={`remove ${tag}`}
							>
								<svg aria-hidden="true" className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						)}
					</span>
				))}
				{!readOnly && (
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						onBlur={() => input && addTag(input)}
						placeholder={tags.length === 0 ? "add tags..." : ""}
						className="flex-1 min-w-[100px] bg-transparent outline-none text-base text-white placeholder:text-white/30 py-1"
					/>
				)}
			</div>
		</div>
	);
}
