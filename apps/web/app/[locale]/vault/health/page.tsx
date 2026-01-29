"use client";

import { useState, useEffect } from "react";
import { analyze, type HealthReport } from "@/lib/health";
import * as store from "../vault/store";
import { Page, Header, Button, Loading } from "@/components/dashboard";
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
		const items = await store.load();
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
			<Page>
				<Header title="security health" description="analyzing your vault..." />
				<Loading text="analyzing passwords..." />
			</Page>
		);
	}

	if (!report) {
		return (
			<Page>
				<Header title="security health" description="check the security of your passwords" />
				<div className="bg-[#161616]/80 backdrop-blur-sm border border-white/5 rounded-xl p-10">
					<p className="text-white/50">failed to analyze vault</p>
				</div>
			</Page>
		);
	}

	return (
		<Page>
			<Header
				title="security health"
				description="check the security of your passwords"
				action={
					<Button variant="secondary" onClick={recheck} disabled={checking}>
						{checking ? "checking..." : "recheck"}
					</Button>
				}
			/>

			<Score value={report.score} total={report.totalPasswords} />
			<Stats report={report} />
			<Issues issues={report.issues} />
		</Page>
	);
}
