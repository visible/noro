"use client";

import { useState, useEffect } from "react";
import { Scan } from "./scan";
import { Stats } from "./stats";
import { Results } from "./results";
import { Empty } from "./empty";
import * as store from "../vault/store";
import type { VaultItem } from "../vault/store";
import type { LoginData } from "@/lib/types";
import { checkpassword, type BreachResult } from "@/lib/breach";

export type BreachItem = {
	id: string;
	title: string;
	username: string;
	breached: boolean;
	count: number;
};

export default function Breaches() {
	const [scanning, setScanning] = useState(false);
	const [scanned, setScanned] = useState(false);
	const [progress, setProgress] = useState(0);
	const [breaches, setBreaches] = useState<BreachItem[]>([]);
	const [logins, setLogins] = useState<VaultItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [checked, setChecked] = useState(0);

	useEffect(() => {
		loaditems();
	}, []);

	async function loaditems() {
		setLoading(true);
		const items = await store.load();
		const loginsonly = items.filter((i) => {
			if (i.type !== "login") return false;
			const data = i.data as LoginData;
			return !!data.password;
		});
		setLogins(loginsonly);
		setLoading(false);
	}

	async function scan() {
		setScanning(true);
		setProgress(0);
		const results: BreachItem[] = [];
		const total = logins.length;
		let scannedcount = 0;

		for (let i = 0; i < logins.length; i++) {
			const item = logins[i];
			const data = item.data as LoginData;
			setProgress(Math.round(((i + 1) / total) * 100));

			if (data.password) {
				scannedcount++;
				try {
					const result: BreachResult = await checkpassword(data.password);
					if (result.breached) {
						results.push({
							id: item.id,
							title: item.title,
							username: data.username || "unknown",
							breached: true,
							count: result.count,
						});
					}
				} catch {
					continue;
				}
			}
		}

		setBreaches(results);
		setChecked(scannedcount);
		setScanning(false);
		setScanned(true);
	}

	if (loading) {
		return (
			<div className="h-full overflow-y-auto scrollbar-hidden px-8 py-10">
				<div className="max-w-4xl">
					<header className="mb-8">
						<h1 className="text-2xl font-serif text-[#ededed] tracking-tight">
							Breach Monitor
						</h1>
						<p className="text-white/40 mt-1">
							loading vault items...
						</p>
					</header>
					<div className="flex items-center justify-center py-24">
						<div className="w-10 h-10 border-2 border-white/5 border-t-[#d4b08c] rounded-full animate-spin" />
					</div>
				</div>
			</div>
		);
	}

	const found = breaches.length;
	const secure = checked - found;

	return (
		<div className="h-full overflow-y-auto scrollbar-hidden px-8 py-10">
			<div className="max-w-4xl">
				<header className="mb-8">
					<h1 className="text-2xl font-serif text-[#ededed] tracking-tight">
						Breach Monitor
					</h1>
					<p className="text-white/40 mt-1">
						check if your credentials have been exposed
					</p>
				</header>

				<Scan
					scanning={scanning}
					scanned={scanned}
					progress={progress}
					onScan={scan}
					itemCount={logins.length}
				/>

				{scanned && (
					<>
						<Stats checked={checked} found={found} secure={secure} />
						<Results breaches={breaches} />
					</>
				)}

				{!scanned && !scanning && <Empty itemCount={logins.length} />}
			</div>
		</div>
	);
}
