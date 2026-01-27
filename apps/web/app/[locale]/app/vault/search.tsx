"use client";

interface Props {
	value: string;
	onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
	return (
		<div className="relative">
			<svg
				aria-hidden="true"
				className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
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
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="search vault..."
				className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-[#FF6B00] transition-colors"
			/>
			{value && (
				<button
					onClick={() => onChange("")}
					className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
				>
					<svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			)}
		</div>
	);
}
