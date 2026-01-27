"use client";

import { useState, useEffect } from "react";
import { analyze, type HealthReport, type HealthIssue, type IssueType } from "@/lib/health";
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
			<div className="max-w-3xl">
				<h1 className="text-2xl font-bold mb-8">password health</h1>
				<div className="flex items-center justify-center py-16">
					<div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
				</div>
			</div>
		);
	}

	if (!report) {
		return (
			<div className="max-w-3xl">
				<h1 className="text-2xl font-bold mb-8">password health</h1>
				<p className="text-white/40">failed to analyze vault</p>
			</div>
		);
	}

	return (
		<div className="max-w-3xl">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-bold">password health</h1>
				<button
					onClick={recheck}
					disabled={checking}
					className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
				>
					{checking ? "checking..." : "recheck"}
				</button>
			</div>

			<Score value={report.score} total={report.totalPasswords} />
			<Stats report={report} />
			<Issues issues={report.issues} />
		</div>
	);
}
