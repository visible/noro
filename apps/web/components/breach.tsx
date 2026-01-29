"use client";

import { useState } from "react";
import { checkpassword, type BreachResult, type EmailBreachResult } from "@/lib/breach";

interface PasswordBadgeProps {
	password: string;
}

export function PasswordBadge({ password }: PasswordBadgeProps) {
	const [result, setResult] = useState<BreachResult | null>(null);
	const [loading, setLoading] = useState(false);
	const [checked, setChecked] = useState(false);

	async function check() {
		if (!password || loading) return;
		setLoading(true);
		try {
			const r = await checkpassword(password);
			setResult(r);
			setChecked(true);
		} catch {
			setResult(null);
		} finally {
			setLoading(false);
		}
	}

	if (!checked) {
		return (
			<button
				onClick={check}
				disabled={loading}
				className="px-2 py-1 text-xs bg-white/10 rounded hover:bg-white/20 transition-colors"
			>
				{loading ? "checking..." : "check breach"}
			</button>
		);
	}

	if (!result) return null;

	if (result.breached) {
		return (
			<span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">
				{result.count.toLocaleString()} breaches
			</span>
		);
	}

	return (
		<span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
			no breaches
		</span>
	);
}

interface VaultItem {
	id: string;
	title: string;
	password?: string;
}

interface ScannerProps {
	items: VaultItem[];
}

export function Scanner({ items }: ScannerProps) {
	const [results, setResults] = useState<Map<string, BreachResult>>(new Map());
	const [scanning, setScanning] = useState(false);
	const [progress, setProgress] = useState(0);

	async function scan() {
		const passwords = items.filter((i) => i.password);
		if (passwords.length === 0) return;

		setScanning(true);
		setProgress(0);
		const newresults = new Map<string, BreachResult>();

		for (let i = 0; i < passwords.length; i++) {
			const item = passwords[i];
			try {
				const r = await checkpassword(item.password!);
				newresults.set(item.id, r);
			} catch {
				newresults.set(item.id, { breached: false, count: 0 });
			}
			setProgress(((i + 1) / passwords.length) * 100);
			await new Promise((r) => setTimeout(r, 200));
		}

		setResults(newresults);
		setScanning(false);
	}

	const breached = Array.from(results.entries()).filter(([, r]) => r.breached);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">breach scanner</h2>
				<button
					onClick={scan}
					disabled={scanning}
					className="px-4 py-2 bg-[#d4b08c] text-black font-medium rounded-lg hover:bg-[#d4b08c]/90 transition-colors disabled:opacity-50"
				>
					{scanning ? "scanning..." : "scan vault"}
				</button>
			</div>

			{scanning && (
				<div className="space-y-2">
					<div className="h-2 bg-white/10 rounded-full overflow-hidden">
						<div
							className="h-full bg-[#d4b08c] transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<p className="text-sm text-white/40">{Math.round(progress)}% complete</p>
				</div>
			)}

			{!scanning && results.size > 0 && (
				<div className="space-y-3">
					{breached.length === 0 ? (
						<div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
							<p className="text-green-400">all passwords are safe</p>
						</div>
					) : (
						<>
							<div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
								<p className="text-red-400">
									{breached.length} password{breached.length > 1 ? "s" : ""} found in breaches
								</p>
							</div>
							<div className="space-y-2">
								{breached.map(([id, r]) => {
									const item = items.find((i) => i.id === id);
									return (
										<div key={id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
											<span>{item?.title}</span>
											<span className="text-sm text-red-400">{r.count.toLocaleString()} exposures</span>
										</div>
									);
								})}
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}

interface EmailCheckProps {
	email: string;
	result?: EmailBreachResult;
}

export function EmailBreaches({ email, result }: EmailCheckProps) {
	if (!result) return null;

	if (!result.breached) {
		return (
			<div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
				<p className="text-green-400">{email} not found in any breaches</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
				<p className="text-red-400">
					{email} found in {result.breaches.length} breach{result.breaches.length > 1 ? "es" : ""}
				</p>
			</div>
			<div className="space-y-2">
				{result.breaches.map((b) => (
					<div key={b.name} className="p-4 bg-white/5 rounded-lg">
						<div className="flex items-center justify-between mb-2">
							<span className="font-medium">{b.title}</span>
							<span className="text-sm text-white/40">{b.date}</span>
						</div>
						<p className="text-sm text-white/60 mb-2">{b.domain}</p>
						<div className="flex flex-wrap gap-1">
							{b.types.slice(0, 5).map((t) => (
								<span key={t} className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/60">
									{t}
								</span>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
