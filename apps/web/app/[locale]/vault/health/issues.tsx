"use client";

import { useRouter } from "next/navigation";
import type { HealthIssue, IssueType, IssueSeverity } from "@/lib/health";

type Props = {
	issues: HealthIssue[];
};

const typeLabels: Record<IssueType, string> = {
	breached: "data breach",
	weak: "weak password",
	reused: "reused password",
	old: "outdated password",
};

const severityColors: Record<IssueSeverity, { icon: string; bg: string }> = {
	critical: {
		icon: "text-red-400",
		bg: "bg-red-500/20",
	},
	warning: {
		icon: "text-yellow-400",
		bg: "bg-yellow-500/20",
	},
	info: {
		icon: "text-blue-400",
		bg: "bg-blue-500/20",
	},
};

const severityIcons: Record<IssueSeverity, string> = {
	critical: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
	warning: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
	info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

const typeBadgeColors: Record<IssueType, string> = {
	breached: "bg-red-500/20 text-red-400",
	weak: "bg-[#FF6B00]/20 text-[#FF6B00]",
	reused: "bg-yellow-500/20 text-yellow-400",
	old: "bg-blue-500/20 text-blue-400",
};

export function Issues({ issues }: Props) {
	const router = useRouter();

	function handleFix(itemId: string) {
		router.push(`/vault/vault?edit=${itemId}`);
	}

	if (issues.length === 0) {
		return (
			<div className="bg-green-500/10 rounded-xl p-10 text-center border border-green-500/20">
				<div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg
						className="w-8 h-8 text-green-400"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<p className="text-lg font-semibold text-white">no issues found</p>
				<p className="text-sm text-white/50 mt-1">your passwords look secure</p>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold text-white">
					issues
				</h2>
				<span className="text-sm text-white/50">
					{issues.length} found
				</span>
			</div>
			<div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
				<table className="w-full">
					<thead>
						<tr className="border-b border-white/5 bg-white/5">
							<th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider w-12"></th>
							<th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">item</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">type</th>
							<th className="px-4 py-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider w-24">action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-white/5">
						{issues.map((issue) => {
							const colors = severityColors[issue.severity];
							return (
								<tr key={issue.id} className="hover:bg-white/5 transition-colors">
									<td className="px-4 py-4">
										<div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
											<svg
												className={`w-4 h-4 ${colors.icon}`}
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												aria-hidden="true"
											>
												<path d={severityIcons[issue.severity]} />
											</svg>
										</div>
									</td>
									<td className="px-4 py-4">
										<p className="font-medium text-white">{issue.itemTitle}</p>
										<p className="text-sm text-white/50 mt-0.5">{issue.message}</p>
									</td>
									<td className="px-4 py-4">
										<span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${typeBadgeColors[issue.type]}`}>
											{typeLabels[issue.type]}
										</span>
									</td>
									<td className="px-4 py-4 text-right">
										<button
											onClick={() => handleFix(issue.itemId)}
											className="px-3 py-1.5 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
										>
											fix
										</button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
