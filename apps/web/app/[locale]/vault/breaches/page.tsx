"use client";

import { useState } from "react";
import { Scan } from "./scan";
import { Stats } from "./stats";
import { Results } from "./results";
import { Empty } from "./empty";

const mockBreaches = [
	{
		id: "1",
		title: "Adobe",
		site: "adobe.com",
		date: "2013-10-04",
		severity: "critical" as const,
		exposed: ["email", "password", "username"],
	},
	{
		id: "2",
		title: "LinkedIn",
		site: "linkedin.com",
		date: "2021-06-22",
		severity: "high" as const,
		exposed: ["email", "phone", "name"],
	},
	{
		id: "3",
		title: "Dropbox",
		site: "dropbox.com",
		date: "2012-07-01",
		severity: "medium" as const,
		exposed: ["email", "password"],
	},
];

export default function Breaches() {
	const [scanning, setScanning] = useState(false);
	const [scanned, setScanned] = useState(false);
	const [progress, setProgress] = useState(0);

	async function scan() {
		setScanning(true);
		setProgress(0);

		for (let i = 0; i <= 100; i += 10) {
			await new Promise((r) => setTimeout(r, 150));
			setProgress(i);
		}

		setScanning(false);
		setScanned(true);
	}

	return (
		<div className="h-full overflow-y-auto scrollbar-hidden px-8 py-10">
			<div className="max-w-4xl">
				<header className="mb-8">
					<h1 className="text-2xl font-semibold text-white tracking-tight">
						breach monitor
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
				/>

				{scanned && (
					<>
						<Stats checked={47} found={3} secure={44} />
						<Results breaches={mockBreaches} />
					</>
				)}

				{!scanned && !scanning && <Empty />}
			</div>
		</div>
	);
}
