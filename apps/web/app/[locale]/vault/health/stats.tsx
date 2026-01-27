"use client";

import type { HealthReport } from "@/lib/health";

type Props = {
	report: HealthReport;
};

type Stat = {
	label: string;
	count: number;
	color: string;
	bg: string;
	icon: string;
};

export function Stats({ report }: Props) {
	const stats: Stat[] = [
		{
			label: "breached",
			count: report.breachedCount,
			color: "text-red-400",
			bg: "bg-red-500/20",
			icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
		},
		{
			label: "weak",
			count: report.weakCount,
			color: "text-[#FF6B00]",
			bg: "bg-[#FF6B00]/20",
			icon: "M13 10V3L4 14h7v7l9-11h-7z",
		},
		{
			label: "reused",
			count: report.reusedCount,
			color: "text-yellow-400",
			bg: "bg-yellow-500/20",
			icon: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
		},
		{
			label: "outdated",
			count: report.oldCount,
			color: "text-blue-400",
			bg: "bg-blue-500/20",
			icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
		},
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
			{stats.map((stat) => (
				<div key={stat.label} className="bg-white/5 rounded-xl p-5 border border-white/10">
					<div className="flex items-center gap-3 mb-3">
						<div className={`${stat.bg} p-2 rounded-lg`}>
							<svg
								className={`w-5 h-5 ${stat.color}`}
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d={stat.icon} />
							</svg>
						</div>
					</div>
					<p className="text-3xl font-bold text-white mb-1">{stat.count}</p>
					<p className="text-sm text-white/50">{stat.label}</p>
				</div>
			))}
		</div>
	);
}
