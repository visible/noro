"use client";

import { useRouter } from "next/navigation";
import type { HealthIssue, IssueType, IssueSeverity } from "@/lib/health";

type Props = {
	issues: HealthIssue[];
};

const typeLabels: Record<IssueType, string> = {
	breached: "breached",
	weak: "weak",
	reused: "reused",
	old: "outdated",
};

const severityStyles: Record<IssueSeverity, { badge: string }> = {
	critical: { badge: "bg-red-500/10 text-red-400 border border-red-500/20" },
	warning: { badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
	info: { badge: "bg-[#d4b08c]/10 text-[#d4b08c] border border-[#d4b08c]/20" },
};

export function Issues({ issues }: Props) {
	const router = useRouter();

	function handleFix(itemId: string) {
		router.push(`/vault/vault?edit=${itemId}`);
	}

	if (issues.length === 0) {
		return (
			<div className="bg-[#d4b08c]/5 rounded-xl p-12 text-center border border-[#d4b08c]/10">
				<div className="w-14 h-14 bg-gradient-to-br from-[#d4b08c]/20 to-[#d4b08c]/5 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg
						className="w-7 h-7 text-[#d4b08c]"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M20 6L9 17l-5-5" />
					</svg>
				</div>
				<p className="text-lg font-serif text-white">all clear</p>
				<p className="text-sm text-white/40 mt-1">no security issues found</p>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">
					issues
				</h2>
				<span className="text-sm text-white/40">
					{issues.length} found
				</span>
			</div>
			<div className="bg-[#161616]/80 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden">
				<table className="w-full">
					<thead>
						<tr className="border-b border-white/5">
							<th className="px-5 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
								item
							</th>
							<th className="px-5 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
								issue
							</th>
							<th className="px-5 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
								severity
							</th>
							<th className="px-5 py-3 text-right text-xs font-medium text-white/40 uppercase tracking-wider">
								action
							</th>
						</tr>
					</thead>
					<tbody>
						{issues.map((issue, i) => (
							<tr
								key={issue.id}
								className={i !== issues.length - 1 ? "border-b border-white/5" : ""}
							>
								<td className="px-5 py-4">
									<p className="font-medium text-white">{issue.itemTitle}</p>
									<p className="text-sm text-white/40 mt-0.5">{issue.message}</p>
								</td>
								<td className="px-5 py-4">
									<span className="text-sm text-white/50">
										{typeLabels[issue.type]}
									</span>
								</td>
								<td className="px-5 py-4">
									<span
										className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-md ${severityStyles[issue.severity].badge}`}
									>
										{issue.severity}
									</span>
								</td>
								<td className="px-5 py-4 text-right">
									<button
										onClick={() => handleFix(issue.itemId)}
										className="px-3.5 py-1.5 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all"
									>
										fix
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
