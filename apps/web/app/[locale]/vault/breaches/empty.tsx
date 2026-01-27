"use client";

export function Empty() {
	return (
		<div className="bg-zinc-900 border border-white/[0.08] rounded-xl p-12 text-center">
			<div className="w-16 h-16 bg-white/[0.04] rounded-full flex items-center justify-center mx-auto mb-5">
				<svg
					className="w-8 h-8 text-white/30"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="M21 21l-4.35-4.35" />
				</svg>
			</div>
			<p className="text-white/80 font-medium mb-1">no scan yet</p>
			<p className="text-white/40 text-sm">
				click check now to scan your passwords
			</p>
		</div>
	);
}
