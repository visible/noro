"use client";

type Props = {
	itemCount: number;
};

export function Empty({ itemCount }: Props) {
	if (itemCount === 0) {
		return (
			<div className="bg-[#161616] border border-white/5 rounded-2xl p-12 text-center">
				<div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center mx-auto mb-5">
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
						<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
						<circle cx="12" cy="7" r="4" />
					</svg>
				</div>
				<p className="text-white/80 font-serif text-lg mb-1">No Credentials Found</p>
				<p className="text-white/40 text-sm">
					add login items with email addresses to check for breaches
				</p>
			</div>
		);
	}

	return (
		<div className="bg-[#161616] border border-white/5 rounded-2xl p-12 text-center">
			<div className="w-16 h-16 bg-gradient-to-br from-[#d4b08c]/20 to-[#d4b08c]/5 rounded-xl flex items-center justify-center mx-auto mb-5">
				<svg
					className="w-8 h-8 text-[#d4b08c]/60"
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
			<p className="text-white/80 font-serif text-lg mb-1">Ready to Scan</p>
			<p className="text-white/40 text-sm">
				click check now to scan {itemCount} password{itemCount !== 1 ? "s" : ""} against known breaches
			</p>
		</div>
	);
}
