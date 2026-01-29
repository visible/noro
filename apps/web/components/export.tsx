"use client";

import { useState } from "react";
import { Modal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/modal";
import { encryptexport, tocsv, download } from "@/lib/transfer";
import type { ExportItem, ExportData } from "@/lib/transfer";

interface Props {
	items: ExportItem[];
	open: boolean;
	onclose: () => void;
}

export function Export({ items, open, onclose }: Props) {
	const [format, setFormat] = useState<"encrypted" | "csv">("encrypted");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleexport() {
		setError("");

		if (format === "encrypted") {
			if (!password) {
				setError("password required");
				return;
			}
			if (password !== confirm) {
				setError("passwords do not match");
				return;
			}
			if (password.length < 8) {
				setError("password must be at least 8 characters");
				return;
			}
		}

		setLoading(true);

		try {
			if (format === "encrypted") {
				const data: ExportData = {
					version: 1,
					exported: new Date().toISOString(),
					items,
				};
				const encrypted = await encryptexport(data, password);
				download(encrypted, "noro-export.json", "application/json");
			} else {
				const csv = tocsv(items);
				download(csv, "noro-export.csv", "text/csv");
			}
			onclose();
		} catch (e) {
			setError(e instanceof Error ? e.message : "export failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Modal open={open} onClose={onclose}>
			<ModalHeader onClose={onclose}>export vault</ModalHeader>
			<ModalContent>
				<div className="mb-6">
					<label className="block text-sm text-white/60 mb-3">format</label>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setFormat("encrypted")}
							className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
								format === "encrypted" ? "bg-white/20 text-white" : "bg-white/5 text-white/40"
							}`}
						>
							encrypted json
						</button>
						<button
							type="button"
							onClick={() => setFormat("csv")}
							className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
								format === "csv" ? "bg-white/20 text-white" : "bg-white/5 text-white/40"
							}`}
						>
							csv
						</button>
					</div>
				</div>

				{format === "encrypted" && (
					<>
						<div className="mb-4">
							<label className="block text-sm text-white/60 mb-2">password</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="min 8 characters"
								className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#d4b08c]/50"
							/>
						</div>
						<div className="mb-4">
							<label className="block text-sm text-white/60 mb-2">confirm password</label>
							<input
								type="password"
								value={confirm}
								onChange={(e) => setConfirm(e.target.value)}
								placeholder="confirm password"
								className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#d4b08c]/50"
							/>
						</div>
					</>
				)}

				{format === "csv" && (
					<p className="text-sm text-white/40">
						csv exports are unencrypted and should only be used for migration to other password
						managers. delete the file after import.
					</p>
				)}

				{error && <p className="text-red-400 text-sm mt-4">{error}</p>}
			</ModalContent>
			<ModalFooter>
				<button
					type="button"
					onClick={onclose}
					className="flex-1 px-4 py-2.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
				>
					cancel
				</button>
				<button
					type="button"
					onClick={handleexport}
					disabled={loading}
					className="flex-1 px-4 py-2.5 bg-[#d4b08c] text-black rounded-lg hover:bg-[#d4b08c]/90 transition-colors font-medium disabled:opacity-50"
				>
					{loading ? "exporting..." : `export ${items.length} items`}
				</button>
			</ModalFooter>
		</Modal>
	);
}
