"use client";

import { useState, useEffect } from "react";
import type { ActivityAction, ActivityEntry } from "@/lib/activity";
import * as activity from "@/lib/activity";

const actions: { value: ActivityAction | "all"; label: string }[] = [
	{ value: "all", label: "all" },
	{ value: "login", label: "sign in" },
	{ value: "logout", label: "sign out" },
	{ value: "item_created", label: "created" },
	{ value: "item_updated", label: "updated" },
	{ value: "item_deleted", label: "deleted" },
	{ value: "item_viewed", label: "viewed" },
	{ value: "password_changed", label: "password" },
	{ value: "export", label: "export" },
	{ value: "import", label: "import" },
];

const icons: Record<ActivityAction, React.ReactNode> = {
	login: (
		<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
		</svg>
	),
	logout: (
		<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
		</svg>
	),
	item_created: (
		<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
		</svg>
	),
	item_updated: (
		<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
		</svg>
	),
	item_deleted: (
		<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
		</svg>
	),
	item_viewed: (
		<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		</svg>
	),
	password_changed: (
		<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
		</svg>
	),
	export: (
		<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
		</svg>
	),
	import: (
		<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
		</svg>
	),
};

const PER_PAGE = 20;

export default function Activity() {
	const [entries, setEntries] = useState<ActivityEntry[]>([]);
	const [total, setTotal] = useState(0);
	const [filter, setFilter] = useState<ActivityAction | "all">("all");
	const [page, setPage] = useState(0);
	const [expanded, setExpanded] = useState<string | null>(null);

	useEffect(() => {
		const action = filter === "all" ? null : filter;
		const result = activity.filter(action, page, PER_PAGE);
		setEntries(result.entries);
		setTotal(result.total);
	}, [filter, page]);

	useEffect(() => {
		setPage(0);
	}, [filter]);

	const pages = Math.ceil(total / PER_PAGE);

	return (
		<div className="max-w-4xl">
			<div className="mb-8">
				<h1 className="text-2xl font-semibold text-white mb-2">activity</h1>
				<p className="text-white/50 text-sm">recent changes to your vault</p>
			</div>

			<div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
				<div className="px-6 py-4 border-b border-white/5 bg-white/5">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-white/60">filter by type</span>
						<select
							value={filter}
							onChange={(e) => setFilter(e.target.value as ActivityAction | "all")}
							className="text-sm bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
						>
							{actions.map((a) => (
								<option key={a.value} value={a.value} className="bg-stone-900 text-white">
									{a.label}
								</option>
							))}
						</select>
					</div>
				</div>

				{entries.length === 0 ? (
					<div className="px-6 py-16 text-center">
						<div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
							<svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<p className="text-white/60 text-sm font-medium">no activity yet</p>
						<p className="text-white/40 text-xs mt-1">your recent actions will appear here</p>
					</div>
				) : (
					<div className="divide-y divide-white/5">
						{entries.map((entry) => {
							const isExpanded = expanded === entry.id;
							return (
								<div key={entry.id} className="group">
									<button
										onClick={() => setExpanded(isExpanded ? null : entry.id)}
										className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
									>
										<div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 shrink-0">
											{icons[entry.action]}
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium text-white">{activity.labels[entry.action]}</span>
												<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
													success
												</span>
											</div>
											<p className="text-xs text-white/50 mt-0.5 truncate">{entry.details}</p>
										</div>
										<div className="text-right shrink-0">
											<p className="text-sm text-white/50">{activity.relative(entry.timestamp)}</p>
											{entry.ip && <p className="text-xs text-white/40">{entry.ip}</p>}
										</div>
										<svg
											className={`w-4 h-4 text-white/40 transition-transform ${isExpanded ? "rotate-180" : ""}`}
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											aria-hidden="true"
										>
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
										</svg>
									</button>
									{isExpanded && (
										<div className="px-6 pb-4 pl-18 bg-white/5">
											<div className="ml-12 p-4 bg-white/5 rounded-lg border border-white/10">
												<div className="grid grid-cols-2 gap-4 text-sm">
													<div>
														<p className="text-white/40 text-xs mb-1">timestamp</p>
														<p className="text-white/80">{new Date(entry.timestamp).toLocaleString()}</p>
													</div>
													<div>
														<p className="text-white/40 text-xs mb-1">action</p>
														<p className="text-white/80">{entry.action}</p>
													</div>
													<div className="col-span-2">
														<p className="text-white/40 text-xs mb-1">details</p>
														<p className="text-white/80">{entry.details || "no additional details"}</p>
													</div>
													{entry.ip && (
														<div className="col-span-2">
															<p className="text-white/40 text-xs mb-1">ip address</p>
															<p className="text-white/80">{entry.ip}</p>
														</div>
													)}
												</div>
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}

				{pages > 1 && (
					<div className="px-6 py-4 border-t border-white/5 bg-white/5 flex items-center justify-between">
						<p className="text-sm text-white/50">
							showing {page * PER_PAGE + 1}-{Math.min((page + 1) * PER_PAGE, total)} of {total}
						</p>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setPage(Math.max(0, page - 1))}
								disabled={page === 0}
								className="px-3 py-1.5 text-sm bg-white/10 border border-white/10 rounded-lg hover:bg-white/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-white"
							>
								previous
							</button>
							<button
								onClick={() => setPage(Math.min(pages - 1, page + 1))}
								disabled={page >= pages - 1}
								className="px-3 py-1.5 text-sm bg-white/10 border border-white/10 rounded-lg hover:bg-white/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-white"
							>
								next
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
