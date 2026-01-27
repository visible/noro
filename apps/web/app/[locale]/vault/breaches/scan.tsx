"use client";

type Props = {
	scanning: boolean;
	scanned: boolean;
	progress: number;
	onScan: () => void;
};

export function Scan({ scanning, scanned, progress, onScan }: Props) {
	return (
		<div className="bg-zinc-900 border border-white/[0.08] rounded-xl p-6 mb-8">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-5">
					<div className="relative">
						<div className="w-14 h-14 rounded-xl bg-white/[0.04] flex items-center justify-center">
							<svg
								className="w-7 h-7 text-white/70"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
							</svg>
						</div>
						{scanned && (
							<div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
								<svg
									className="w-3 h-3 text-white"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="3"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
								>
									<path d="M5 12l5 5L20 7" />
								</svg>
							</div>
						)}
						{!scanned && !scanning && (
							<div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
								<div className="w-2 h-2 rounded-full bg-white/40" />
							</div>
						)}
					</div>
					<div>
						<p className="font-medium text-white text-lg">
							{scanning ? "scanning..." : scanned ? "scan complete" : "ready to scan"}
						</p>
						<p className="text-sm text-white/40 mt-0.5">
							{scanning
								? `checking ${progress}% of passwords`
								: scanned
								? "last checked just now"
								: "check your passwords against known breaches"}
						</p>
					</div>
				</div>
				<button
					onClick={onScan}
					disabled={scanning}
					className="px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
				>
					{scanning ? "scanning..." : "check now"}
				</button>
			</div>

			{scanning && (
				<div className="mt-5">
					<div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-150"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
