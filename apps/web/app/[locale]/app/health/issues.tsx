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

const severityColors: Record<IssueSeverity, string> = {
	critical: "bg-red-500/20 text-red-400 border-red-500/30",
	warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
	info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const severityIcons: Record<IssueSeverity, string> = {
	critical: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
	warning: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
	info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

export function Issues({ issues }: Props) {
	const router = useRouter();

	function handleFix(itemId: string) {
		router.push(`/app/vault?edit=${itemId}`);
	}

	if (issues.length === 0) {
		return (
			<div className="bg-white/5 rounded-xl p-8 text-center">
				<svg
					className="w-12 h-12 mx-auto mb-4 text-green-500"
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
				<p className="text-lg font-medium">no issues found</p>
				<p className="text-sm text-white/40 mt-1">your passwords look secure</p>
			</div>
		);
	}

	return (
		<div>
			<h2 className="text-lg font-semibold mb-4">
				{issues.length} issue{issues.length !== 1 ? "s" : ""} found
			</h2>
			<div className="space-y-3">
				{issues.map((issue) => (
					<div
						key={issue.id}
						className={`rounded-xl border p-4 ${severityColors[issue.severity]}`}
					>
						<div className="flex items-start gap-4">
							<svg
								className="w-5 h-5 mt-0.5 shrink-0"
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
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<span className="font-medium truncate">{issue.itemTitle}</span>
									<span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
										{typeLabels[issue.type]}
									</span>
								</div>
								<p className="text-sm opacity-80">{issue.message}</p>
							</div>
							<button
								onClick={() => handleFix(issue.itemId)}
								className="px-3 py-1.5 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition-colors shrink-0"
							>
								fix
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
