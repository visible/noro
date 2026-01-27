"use client";

import { useState, useRef } from "react";
import { Modal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/modal";
import { decryptimport } from "@/lib/transfer";
import { parseonepassword, parsebitwarden, parselastpass, parsechrome } from "@/lib/parsers";
import type { ExportItem } from "@/lib/transfer";

type Source = "noro" | "onepassword" | "bitwarden" | "lastpass" | "chrome";

interface Props {
	open: boolean;
	onclose: () => void;
	onimport: (items: ExportItem[]) => void;
}

const sources: [Source, string][] = [
	["noro", "noro"],
	["onepassword", "1password"],
	["bitwarden", "bitwarden"],
	["lastpass", "lastpass"],
	["chrome", "chrome"],
];

export function Import({ open, onclose, onimport }: Props) {
	const [source, setSource] = useState<Source>("noro");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [preview, setPreview] = useState<ExportItem[]>([]);
	const [content, setContent] = useState("");
	const fileref = useRef<HTMLInputElement>(null);

	function reset() {
		setPassword("");
		setError("");
		setPreview([]);
		setContent("");
		if (fileref.current) fileref.current.value = "";
	}

	function handleclose() {
		reset();
		onclose();
	}

	async function handlefile(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		setError("");
		setPreview([]);

		const text = await file.text();
		setContent(text);

		if (source === "noro") return;

		try {
			const result = parseformat(text, source);
			if (result.errors.length) {
				setError(result.errors.join(", "));
			}
			setPreview(result.items);
		} catch (err) {
			setError(err instanceof Error ? err.message : "failed to parse file");
		}
	}

	async function handlepassword() {
		if (!content) {
			setError("select a file first");
			return;
		}
		setLoading(true);
		setError("");

		try {
			const data = await decryptimport(content, password);
			setPreview(data.items);
		} catch {
			setError("invalid password or corrupted file");
		} finally {
			setLoading(false);
		}
	}

	function parseformat(text: string, fmt: Source) {
		switch (fmt) {
			case "onepassword":
				return parseonepassword(text);
			case "bitwarden":
				return parsebitwarden(text);
			case "lastpass":
				return parselastpass(text);
			case "chrome":
				return parsechrome(text);
			default:
				return { items: [], errors: ["unknown format"] };
		}
	}

	function handleimport() {
		if (!preview.length) {
			setError("no items to import");
			return;
		}
		onimport(preview);
		handleclose();
	}

	return (
		<Modal open={open} onClose={handleclose}>
			<ModalHeader onClose={handleclose}>import passwords</ModalHeader>
			<ModalContent>
				<div className="mb-6">
					<label className="block text-sm text-white/60 mb-3">source</label>
					<div className="flex flex-wrap gap-2">
						{sources.map(([id, label]) => (
							<button
								key={id}
								type="button"
								onClick={() => {
									setSource(id);
									reset();
								}}
								className={`px-4 py-2 rounded-lg transition-colors text-sm ${
									source === id ? "bg-white/20 text-white" : "bg-white/5 text-white/40"
								}`}
							>
								{label}
							</button>
						))}
					</div>
				</div>

				<div className="mb-6">
					<label className="block text-sm text-white/60 mb-2">
						{source === "noro" || source === "onepassword" || source === "bitwarden" ? "json file" : "csv file"}
					</label>
					<input
						ref={fileref}
						type="file"
						accept={source === "lastpass" || source === "chrome" ? ".csv" : ".json"}
						onChange={handlefile}
						className="w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20"
					/>
				</div>

				{source === "noro" && content && (
					<div className="mb-6">
						<label className="block text-sm text-white/60 mb-2">password</label>
						<div className="flex gap-2">
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="encryption password"
								className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF6B00]/50"
							/>
							<button
								type="button"
								onClick={handlepassword}
								disabled={loading}
								className="px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
							>
								{loading ? "..." : "decrypt"}
							</button>
						</div>
					</div>
				)}

				{error && <p className="text-red-400 text-sm mb-4">{error}</p>}

				{preview.length > 0 && (
					<div>
						<p className="text-sm text-white/60 mb-3">preview ({preview.length} items)</p>
						<div className="bg-white/5 rounded-lg max-h-48 overflow-y-auto">
							{preview.slice(0, 10).map((item, i) => (
								<div key={item.id ?? i} className="px-4 py-3 border-b border-white/5 last:border-0">
									<p className="text-sm truncate">{item.title}</p>
									<p className="text-xs text-white/40">{item.type}</p>
								</div>
							))}
							{preview.length > 10 && (
								<p className="px-4 py-3 text-sm text-white/40">and {preview.length - 10} more...</p>
							)}
						</div>
					</div>
				)}
			</ModalContent>
			<ModalFooter>
				<button
					type="button"
					onClick={handleclose}
					className="flex-1 px-4 py-2.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
				>
					cancel
				</button>
				<button
					type="button"
					onClick={handleimport}
					disabled={!preview.length}
					className="flex-1 px-4 py-2.5 bg-[#FF6B00] text-black rounded-lg hover:bg-[#FF6B00]/90 transition-colors font-medium disabled:opacity-50"
				>
					import {preview.length} items
				</button>
			</ModalFooter>
		</Modal>
	);
}
