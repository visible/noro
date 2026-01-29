"use client";

import { useState } from "react";

type Format = "json" | "csv" | "onepassword" | "bitwarden";

const formats: { id: Format; name: string; description: string; icon: React.ReactNode }[] = [
	{
		id: "json",
		name: "JSON",
		description: "noro native format",
		icon: (
			<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path d="M5 3h2v2H5v5a2 2 0 01-2 2 2 2 0 012 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 00-2-2H0v-2h1a2 2 0 002-2V5a2 2 0 012-2m14 0a2 2 0 012 2v4a2 2 0 002 2h1v2h-1a2 2 0 00-2 2v4a2 2 0 01-2 2h-2v-2h2v-5a2 2 0 012-2 2 2 0 01-2-2V5h-2V3h2z" />
			</svg>
		),
	},
	{
		id: "csv",
		name: "CSV",
		description: "spreadsheet compatible",
		icon: (
			<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 9h-2v1h2v2H9v-4h4v1zm-4 4h6v2H9v-2zm6-8V3.5L18.5 9H15z" />
			</svg>
		),
	},
	{
		id: "onepassword",
		name: "1Password",
		description: "1password import format",
		icon: (
			<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
			</svg>
		),
	},
	{
		id: "bitwarden",
		name: "Bitwarden",
		description: "bitwarden import format",
		icon: (
			<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
			</svg>
		),
	},
];

export default function Export() {
	const [format, setFormat] = useState<Format>("json");
	const [exporting, setExporting] = useState(false);

	async function handleExport() {
		setExporting(true);
		try {
			const res = await fetch(`/api/v1/vault/export?format=${format}`);
			const data = await res.json();

			let content: string;
			let type: string;
			let ext: string;

			if (format === "csv") {
				content = data.csv || "";
				type = "text/csv";
				ext = "csv";
			} else {
				content = JSON.stringify(data, null, 2);
				type = "application/json";
				ext = "json";
			}

			const blob = new Blob([content], { type });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `noro-export-${new Date().toISOString().split("T")[0]}.${ext}`;
			a.click();
			URL.revokeObjectURL(url);
		} catch {
			console.error("failed to export");
		} finally {
			setExporting(false);
		}
	}

	return (
		<div className="h-full overflow-y-auto scrollbar-hidden px-8 py-10">
			<div className="max-w-xl">
				<div className="mb-10">
					<h1 className="text-2xl font-semibold text-white tracking-tight">export vault</h1>
					<p className="text-zinc-500 mt-2 text-sm">download a backup of your encrypted data</p>
				</div>

				<div className="mb-8">
					<label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-4">
						select format
					</label>
					<div className="grid grid-cols-2 gap-3">
						{formats.map((f) => (
							<label
								key={f.id}
								className={`relative flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-200 ${
									format === f.id
										? "bg-orange-500/10 border-2 border-orange-500 shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]"
										: "bg-zinc-900 border-2 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80"
								}`}
							>
								<input
									type="radio"
									name="format"
									value={f.id}
									checked={format === f.id}
									onChange={() => setFormat(f.id)}
									className="sr-only"
								/>
								<div className={`mb-3 ${format === f.id ? "text-orange-500" : "text-zinc-500"}`}>
									{f.icon}
								</div>
								<span className={`font-medium text-sm ${format === f.id ? "text-white" : "text-zinc-300"}`}>
									{f.name}
								</span>
								<span className="text-xs text-zinc-500 mt-0.5">{f.description}</span>
								{format === f.id && (
									<div className="absolute top-3 right-3">
										<svg className="w-4 h-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
										</svg>
									</div>
								)}
							</label>
						))}
					</div>
				</div>

				<div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
					<div className="flex gap-3">
						<div className="shrink-0 mt-0.5">
							<svg className="w-5 h-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
							</svg>
						</div>
						<div>
							<p className="text-amber-400 font-medium text-sm">exported data is unencrypted</p>
							<p className="text-amber-400/70 text-sm mt-1 leading-relaxed">
								your passwords will be visible in plain text. store the exported file securely and delete it when done.
							</p>
						</div>
					</div>
				</div>

				<button
					onClick={handleExport}
					disabled={exporting}
					className="w-full py-3.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
				>
					{exporting ? (
						<span className="flex items-center justify-center gap-2">
							<svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
							</svg>
							exporting...
						</span>
					) : (
						"export vault"
					)}
				</button>

				<p className="text-center text-xs text-zinc-600 mt-4">
					exports include all vault items and metadata
				</p>
			</div>
		</div>
	);
}
