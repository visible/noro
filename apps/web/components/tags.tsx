"use client";

import { useState, KeyboardEvent } from "react";

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
		<div className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus-within:border-[#FF6B00] transition-colors">
			<div className="flex flex-wrap gap-2">
				{tags.map((tag) => (
					<span
						key={tag}
						className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 rounded text-sm"
					>
						{tag}
						{!readOnly && (
							<button
								type="button"
								onClick={() => removeTag(tag)}
								className="text-white/40 hover:text-white"
							>
								<svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
						className="flex-1 min-w-[100px] bg-transparent outline-none text-sm py-1"
					/>
				)}
			</div>
		</div>
	);
}

interface TagListProps {
	tags: string[];
	max?: number;
	onClick?: (tag: string) => void;
}

export function TagList({ tags, max = 3, onClick }: TagListProps) {
	const visible = tags.slice(0, max);
	const remaining = tags.length - max;

	if (tags.length === 0) return null;

	return (
		<div className="flex gap-1 flex-wrap">
			{visible.map((tag) => (
				<span
					key={tag}
					onClick={(e) => {
						if (onClick) {
							e.stopPropagation();
							onClick(tag);
						}
					}}
					className={`px-2 py-0.5 bg-white/10 rounded text-xs text-white/60 ${
						onClick ? "cursor-pointer hover:bg-white/20 hover:text-white" : ""
					}`}
				>
					{tag}
				</span>
			))}
			{remaining > 0 && (
				<span className="px-2 py-0.5 text-xs text-white/40">
					+{remaining}
				</span>
			)}
		</div>
	);
}

interface TagFilterProps {
	tags: string[];
	selected: string | null;
	onSelect: (tag: string | null) => void;
}

export function TagFilter({ tags, selected, onSelect }: TagFilterProps) {
	if (tags.length === 0) return null;

	return (
		<div className="flex gap-2 flex-wrap items-center">
			<svg aria-hidden="true" className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6h.008v.008H6V6z" />
			</svg>
			{selected && (
				<button
					onClick={() => onSelect(null)}
					className="px-2 py-1 rounded text-xs text-white/60 hover:text-white"
				>
					clear
				</button>
			)}
			{tags.map((tag) => (
				<button
					key={tag}
					onClick={() => onSelect(selected === tag ? null : tag)}
					className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
						selected === tag
							? "bg-[#FF6B00] text-black"
							: "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
					}`}
				>
					{tag}
				</button>
			))}
		</div>
	);
}
