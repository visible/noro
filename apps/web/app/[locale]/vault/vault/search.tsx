"use client";

import { forwardRef } from "react";

interface Props {
	value: string;
	onChange: (value: string) => void;
}

export const SearchBar = forwardRef<HTMLInputElement, Props>(function SearchBar({ value, onChange }, ref) {
	return (
		<div className="relative">
			<svg
				aria-hidden="true"
				className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
				/>
			</svg>
			<input
				ref={ref}
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Search items..."
				className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
			/>
			<button
				onClick={() => onChange("")}
				className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-zinc-400 rounded transition-all ${value ? "opacity-100" : "opacity-0 pointer-events-none"}`}
				aria-label="clear search"
			>
				<svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	);
});
