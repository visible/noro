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
			<div className="min-h-screen bg-stone-950 px-6 py-12">
				<div className="max-w-4xl mx-auto">
					<div className="mb-8">
						<h1 className="text-2xl font-semibold text-white">security health</h1>
						<p className="text-white/50 mt-1">analyzing your vault...</p>
					</div>
					<div className="flex items-center justify-center py-24">
						<div className="w-8 h-8 border-2 border-white/10 border-t-[#FF6B00] rounded-full animate-spin" />
					</div>
				</div>
			</div>
		);
	}

	if (!report) {
		return (
			<div className="min-h-screen bg-stone-950 px-6 py-12">
				<div className="max-w-4xl mx-auto">
					<div className="mb-8">
						<h1 className="text-2xl font-semibold text-white">security health</h1>
						<p className="text-white/50 mt-1">check the security of your passwords</p>
					</div>
					<div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
						<p className="text-white/50">failed to analyze vault</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-stone-950 px-6 py-12">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-2xl font-semibold text-white">security health</h1>
						<p className="text-white/50 mt-1">check the security of your passwords</p>
					</div>
					<button
						onClick={recheck}
						disabled={checking}
						className="px-4 py-2 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
					>
						{checking ? "checking..." : "recheck"}
					</button>
				</div>

				<Score value={report.score} total={report.totalPasswords} />
				<Stats report={report} />
				<Issues issues={report.issues} />
			</div>
		</div>
	);
}
