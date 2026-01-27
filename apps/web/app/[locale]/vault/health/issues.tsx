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
	critical: { badge: "bg-red-500/10 text-red-400" },
	warning: { badge: "bg-amber-500/10 text-amber-400" },
	info: { badge: "bg-blue-500/10 text-blue-400" },
};

export function Issues({ issues }: Props) {
	const router = useRouter();

	function handleFix(itemId: string) {
		router.push(`/vault/vault?edit=${itemId}`);
	}

	if (issues.length === 0) {
		return (
			<div className="bg-emerald-500/5 rounded-xl p-12 text-center border border-emerald-500/10">
				<div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
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
						<path d="M20 6L9 17l-5-5" />
					</svg>
				</div>
				<p className="text-lg font-medium text-white">all clear</p>
				<p className="text-sm text-zinc-500 mt-1">no security issues found</p>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
					issues
				</h2>
				<span className="text-sm text-zinc-500">
					{issues.length} found
				</span>
			</div>
			<div className="bg-zinc-900 rounded-xl overflow-hidden">
				<table className="w-full">
					<thead>
						<tr className="border-b border-zinc-800">
							<th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
								item
							</th>
							<th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
								issue
							</th>
							<th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
								severity
							</th>
							<th className="px-5 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
								action
							</th>
						</tr>
					</thead>
					<tbody>
						{issues.map((issue, i) => (
							<tr
								key={issue.id}
								className={i !== issues.length - 1 ? "border-b border-zinc-800/50" : ""}
							>
								<td className="px-5 py-4">
									<p className="font-medium text-white">{issue.itemTitle}</p>
									<p className="text-sm text-zinc-500 mt-0.5">{issue.message}</p>
								</td>
								<td className="px-5 py-4">
									<span className="text-sm text-zinc-400">
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
										className="px-3.5 py-1.5 text-sm font-medium text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
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
