"use client";

type Severity = "critical" | "high" | "medium";

type Breach = {
	id: string;
	title: string;
	site: string;
	date: string;
	severity: Severity;
	exposed: string[];
};

type Props = {
	breaches: Breach[];
};

const severityStyles: Record<Severity, { bg: string; text: string; border: string }> = {
	critical: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
	high: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" },
	medium: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30" },
};

function Icon({ severity }: { severity: Severity }) {
	const colors: Record<Severity, string> = {
		critical: "text-red-400",
		high: "text-orange-400",
		medium: "text-yellow-400",
	};
	const bgs: Record<Severity, string> = {
		critical: "bg-red-500/10",
		high: "bg-orange-500/10",
		medium: "bg-yellow-500/10",
	};

	return (
		<div className={`w-10 h-10 rounded-lg ${bgs[severity]} flex items-center justify-center`}>
			<svg
				className={`w-5 h-5 ${colors[severity]}`}
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
	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-medium text-white">compromised</h2>
				<span className="text-sm text-white/40">{breaches.length} found</span>
			</div>

			<div className="bg-zinc-900 border border-white/[0.08] rounded-xl overflow-hidden">
				<div className="grid grid-cols-[auto_1fr_auto_1fr_auto] gap-4 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
					<div className="w-10" />
					<p className="text-xs font-medium text-white/40 uppercase tracking-wider">breach</p>
					<p className="text-xs font-medium text-white/40 uppercase tracking-wider">severity</p>
					<p className="text-xs font-medium text-white/40 uppercase tracking-wider">exposed</p>
					<p className="text-xs font-medium text-white/40 uppercase tracking-wider text-right">action</p>
				</div>

				<div className="divide-y divide-white/[0.04]">
					{breaches.map((breach) => {
						const style = severityStyles[breach.severity];
						return (
							<div
								key={breach.id}
								className="grid grid-cols-[auto_1fr_auto_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors"
							>
								<Icon severity={breach.severity} />
								<div className="min-w-0">
									<p className="font-medium text-white">{breach.title}</p>
									<p className="text-sm text-white/40">{breach.site}</p>
								</div>
								<span
									className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-md ${style.bg} ${style.text} border ${style.border}`}
								>
									{breach.severity}
								</span>
								<div className="flex flex-wrap gap-1.5">
									{breach.exposed.map((item) => (
										<span
											key={item}
											className="text-xs text-white/50 bg-white/[0.06] px-2 py-0.5 rounded"
										>
											{item}
										</span>
									))}
								</div>
								<button className="px-3.5 py-1.5 text-sm font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 transition-colors">
									fix
								</button>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
