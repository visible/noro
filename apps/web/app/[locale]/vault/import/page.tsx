"use client";

import { useState, useRef } from "react";

type Source = "1password" | "bitwarden" | "lastpass" | "chrome" | "firefox" | "csv";

const sources: { id: Source; name: string; icon: JSX.Element }[] = [
	{
		id: "1password",
		name: "1Password",
		icon: (
			<svg aria-hidden="true" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
			</svg>
		),
	},
	{
		id: "bitwarden",
		name: "Bitwarden",
		icon: (
			<svg aria-hidden="true" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
				<path d="M5 3h14a2 2 0 012 2v10.5a6.5 6.5 0 01-3.5 5.78L12 24l-5.5-2.72A6.5 6.5 0 013 15.5V5a2 2 0 012-2zm7 4a3 3 0 00-3 3v2h6v-2a3 3 0 00-3-3zm-4 5v5h8v-5H8z" />
			</svg>
		),
	},
	{
		id: "lastpass",
		name: "LastPass",
		icon: (
			<svg aria-hidden="true" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
			</svg>
		),
	},
	{
		id: "chrome",
		name: "Chrome",
		icon: (
			<svg aria-hidden="true" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
			</svg>
		),
	},
	{
		id: "firefox",
		name: "Firefox",
		icon: (
			<svg aria-hidden="true" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
			</svg>
		),
	},
	{
		id: "csv",
		name: "CSV",
		icon: (
			<svg aria-hidden="true" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
				<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
			</svg>
		),
	},
];

export default function Import() {
	const [selected, setSelected] = useState<Source | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [dragging, setDragging] = useState(false);
	const [uploading, setUploading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	function handleDrop(e: React.DragEvent) {
		e.preventDefault();
		setDragging(false);
		const dropped = e.dataTransfer.files[0];
		if (dropped) setFile(dropped);
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const selected = e.target.files?.[0];
		if (selected) setFile(selected);
	}

	function handleImport() {
		if (!file || !selected) return;
		setUploading(true);
		setTimeout(() => {
			setUploading(false);
			setFile(null);
			setSelected(null);
		}, 2000);
	}

	return (
		<div className="h-full overflow-y-auto scrollbar-hidden px-8 py-10">
			<div className="max-w-2xl mx-auto">
				<header className="mb-10">
					<h1 className="text-2xl font-semibold text-white">import</h1>
					<p className="text-zinc-500 mt-1">bring your passwords from another manager</p>
				</header>

				<section className="mb-8">
					<label className="block text-sm font-medium text-zinc-400 mb-4">source</label>
					<div className="grid grid-cols-3 gap-3">
						{sources.map((source) => (
							<button
								key={source.id}
								onClick={() => setSelected(source.id)}
								className={`flex flex-col items-center gap-3 p-6 rounded-xl border transition-all duration-150 ${
									selected === source.id
										? "bg-orange-500/5 border-orange-500 text-orange-500"
										: "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:-translate-y-0.5"
								}`}
							>
								{source.icon}
								<span className="text-sm font-medium text-zinc-300">{source.name}</span>
							</button>
						))}
					</div>
				</section>

				<section className="mb-8">
					<label className="block text-sm font-medium text-zinc-400 mb-4">file</label>
					<div
						onDragOver={(e) => {
							e.preventDefault();
							setDragging(true);
						}}
						onDragLeave={() => setDragging(false)}
						onDrop={handleDrop}
						onClick={() => inputRef.current?.click()}
						className={`relative flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-150 ${
							dragging
								? "border-orange-500 bg-orange-500/5"
								: file
									? "border-zinc-700 bg-zinc-900"
									: "border-zinc-700 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900"
						}`}
					>
						<input
							ref={inputRef}
							type="file"
							accept=".csv,.json,.1pux,.1pif"
							onChange={handleFileChange}
							className="hidden"
						/>
						{file ? (
							<div className="flex items-center gap-3">
								<svg aria-hidden="true" className="w-5 h-5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
									<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
								</svg>
								<span className="text-zinc-300 font-medium">{file.name}</span>
								<span className="text-zinc-600 text-sm">{(file.size / 1024).toFixed(1)} KB</span>
							</div>
						) : (
							<>
								<svg aria-hidden="true" className="w-10 h-10 text-zinc-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
									<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
								</svg>
								<p className="text-zinc-400 font-medium">drop file here or click to browse</p>
								<p className="text-zinc-600 text-sm mt-1">.csv, .json, .1pux, .1pif</p>
							</>
						)}
					</div>
				</section>

				<button
					onClick={handleImport}
					disabled={!file || !selected || uploading}
					className="w-full py-3.5 bg-orange-500 text-white font-semibold rounded-xl transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-600 disabled:hover:bg-orange-500"
				>
					{uploading ? (
						<span className="flex items-center justify-center gap-2">
							<svg aria-hidden="true" className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
							</svg>
							importing...
						</span>
					) : (
						"import"
					)}
				</button>
			</div>
		</div>
	);
}
