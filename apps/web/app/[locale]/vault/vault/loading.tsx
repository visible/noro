"use client";

export function VaultLoading() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{Array.from({ length: 6 }).map((_, i) => (
				<div
					key={i}
					className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 animate-pulse"
				>
					<div className="flex items-start gap-3">
						<div className="w-10 h-10 rounded-lg bg-white/[0.04]" />
						<div className="flex-1 space-y-2">
							<div className="h-4 w-2/3 rounded bg-white/[0.04]" />
							<div className="h-3 w-1/2 rounded bg-white/[0.03]" />
						</div>
					</div>
					<div className="flex gap-1.5 mt-3">
						<div className="h-5 w-12 rounded-md bg-white/[0.03]" />
						<div className="h-5 w-16 rounded-md bg-white/[0.03]" />
					</div>
				</div>
			))}
		</div>
	);
}
