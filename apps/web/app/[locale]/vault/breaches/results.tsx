"use client";

import { useRouter } from "next/navigation";
import type { BreachItem } from "./page";

type Props = {
	breaches: BreachItem[];
};

function formatcount(count: number): string {
	if (count >= 1000000) {
		return `${(count / 1000000).toFixed(1)}M`;
	}
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1)}K`;
	}
	return count.toString();
}

function Icon() {
	return (
		<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center">
			<svg
				className="w-5 h-5 text-red-400"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
		</div>
	);
}

export function Results({ breaches }: Props) {
	const router = useRouter();

	function handlefix(id: string) {
		router.push(`/vault/vault?edit=${id}`);
	}

	if (breaches.length === 0) {
		return (
			<div className="bg-emerald-500/5 rounded-2xl p-12 text-center border border-emerald-500/10">
				<div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-xl flex items-center justify-center mx-auto mb-4">
					<svg
						className="w-7 h-7 text-emerald-400"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
					</svg>
				</div>
				<p className="text-lg font-serif text-white">All Clear</p>
				<p className="text-sm text-white/40 mt-1">no compromised passwords found</p>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">compromised</h2>
				<span className="text-sm text-white/40">{breaches.length} found</span>
			</div>

			<div className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden">
				<div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
					<div className="w-10" />
					<p className="text-xs font-medium text-white/30 uppercase tracking-wider">item</p>
					<p className="text-xs font-medium text-white/30 uppercase tracking-wider">exposures</p>
					<p className="text-xs font-medium text-white/30 uppercase tracking-wider text-right">action</p>
				</div>

				<div className="divide-y divide-white/5">
					{breaches.map((breach) => (
						<div
							key={breach.id}
							className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors"
						>
							<Icon />
							<div className="min-w-0">
								<p className="font-medium text-white">{breach.title}</p>
								<p className="text-sm text-white/40 truncate">{breach.username}</p>
							</div>
							<span className="inline-flex text-xs font-medium px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
								{formatcount(breach.count)}x
							</span>
							<button
								onClick={() => handlefix(breach.id)}
								className="px-3.5 py-1.5 text-sm font-medium text-[#d4b08c] bg-[#d4b08c]/10 border border-[#d4b08c]/20 rounded-full hover:bg-[#d4b08c]/20 transition-colors"
							>
								fix
							</button>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
