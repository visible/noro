"use client";

import { useState, useEffect } from "react";
import type { ActivityAction, ActivityEntry } from "@/lib/activity";
import * as activity from "@/lib/activity";

const actions: { value: ActivityAction | "all"; label: string }[] = [
	{ value: "all", label: "all activity" },
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

const PER_PAGE = 20;

export default function Activity() {
	const [entries, setEntries] = useState<ActivityEntry[]>([]);
	const [total, setTotal] = useState(0);
	const [filter, setFilter] = useState<ActivityAction | "all">("all");
	const [page, setPage] = useState(0);

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
		<div className="max-w-2xl">
			<h1 className="text-2xl font-bold mb-8">activity</h1>

			<div className="flex flex-wrap gap-2 mb-6">
				{actions.map((a) => (
					<button
						key={a.value}
						onClick={() => setFilter(a.value)}
						className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
							filter === a.value
								? "bg-[#FF6B00] text-black"
								: "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
						}`}
					>
						{a.label}
					</button>
				))}
			</div>

			{entries.length === 0 ? (
				<div className="text-center py-16">
					<p className="text-white/40">no activity yet</p>
				</div>
			) : (
				<>
					<div className="space-y-1">
						{entries.map((entry) => (
							<div
								key={entry.id}
								className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg"
							>
								<div className="flex-1 min-w-0">
									<p className="font-medium truncate">
										{activity.labels[entry.action]}
									</p>
									<p className="text-sm text-white/40 truncate">{entry.details}</p>
								</div>
								<div className="text-right ml-4 shrink-0">
									<p className="text-sm text-white/60">{activity.relative(entry.timestamp)}</p>
									{entry.ip && <p className="text-xs text-white/30">{entry.ip}</p>}
								</div>
							</div>
						))}
					</div>

					{pages > 1 && (
						<div className="flex items-center justify-center gap-2 mt-6">
							<button
								onClick={() => setPage(Math.max(0, page - 1))}
								disabled={page === 0}
								className="px-3 py-1.5 text-sm bg-white/5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
							>
								prev
							</button>
							<span className="text-sm text-white/40 px-3">
								{page + 1} / {pages}
							</span>
							<button
								onClick={() => setPage(Math.min(pages - 1, page + 1))}
								disabled={page >= pages - 1}
								className="px-3 py-1.5 text-sm bg-white/5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
							>
								next
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
