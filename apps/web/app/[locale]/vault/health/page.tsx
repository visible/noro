"use client";

import { useState, useEffect } from "react";
import { analyze, type HealthReport } from "@/lib/health";
import * as store from "../vault/store";
import { Score } from "./score";
import { Stats } from "./stats";
import { Issues } from "./issues";

export default function Health() {
	const [report, setReport] = useState<HealthReport | null>(null);
	const [loading, setLoading] = useState(true);
	const [checking, setChecking] = useState(false);

	useEffect(() => {
		runAnalysis();
	}, []);

	async function runAnalysis() {
		setLoading(true);
		const items = store.load();
		const result = await analyze(items);
		setReport(result);
		setLoading(false);
	}

	async function recheck() {
		setChecking(true);
		await runAnalysis();
		setChecking(false);
	}

	if (loading) {
		return (
			<div className="h-full overflow-y-auto scrollbar-hidden px-8 py-10">
				<div className="max-w-4xl mx-auto">
					<header className="text-center mb-12">
						<h1 className="text-2xl font-semibold text-white">security health</h1>
						<p className="text-zinc-500 mt-1">analyzing your vault...</p>
					</header>
					<div className="flex items-center justify-center py-24">
						<div className="w-10 h-10 border-2 border-zinc-800 border-t-emerald-500 rounded-full animate-spin" />
					</div>
				</div>
			</div>
		);
	}

	if (!report) {
		return (
			<div className="h-full overflow-y-auto scrollbar-hidden px-8 py-10">
				<div className="max-w-4xl mx-auto">
					<header className="text-center mb-12">
						<h1 className="text-2xl font-semibold text-white">security health</h1>
						<p className="text-zinc-500 mt-1">check the security of your passwords</p>
					</header>
					<div className="bg-zinc-900 rounded-xl p-10 text-center">
						<p className="text-zinc-500">failed to analyze vault</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full overflow-y-auto scrollbar-hidden px-8 py-10">
			<div className="max-w-4xl mx-auto">
				<header className="flex items-center justify-between mb-12">
					<div>
						<h1 className="text-2xl font-semibold text-white">security health</h1>
						<p className="text-zinc-500 mt-1">check the security of your passwords</p>
					</div>
					<button
						onClick={recheck}
						disabled={checking}
						className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
					>
						{checking ? "checking..." : "recheck"}
					</button>
				</header>

				<Score value={report.score} total={report.totalPasswords} />
				<Stats report={report} />
				<Issues issues={report.issues} />
			</div>
		</div>
	);
}
