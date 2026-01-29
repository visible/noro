"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/client";
import { Modal } from "@/components/settings";

interface Props {
	open: boolean;
	onClose: () => void;
}

export function DeleteModal({ open, onClose }: Props) {
	const router = useRouter();
	const [confirm, setConfirm] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleDelete() {
		if (confirm !== "delete my account") return;
		setLoading(true);

		try {
			await fetch("/api/auth/delete", { method: "DELETE" });
			await signOut();
			router.push("/");
		} catch {
			console.error("failed to delete account");
		} finally {
			setLoading(false);
		}
	}

	function handleClose() {
		setConfirm("");
		onClose();
	}

	return (
		<Modal open={open} onClose={handleClose} title="delete account">
			<div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
				<p className="text-red-400 text-sm font-medium">this action cannot be undone</p>
				<p className="text-red-400/80 text-sm mt-1">
					all your vault items, api keys, and data will be permanently deleted.
				</p>
			</div>
			<p className="text-white/40 text-sm mb-4">
				we recommend exporting your data before deleting your account.
			</p>
			<div className="mb-4">
				<label className="block text-sm font-medium text-white/70 mb-1.5">
					type &quot;delete my account&quot; to confirm
				</label>
				<input
					type="text"
					value={confirm}
					onChange={(e) => setConfirm(e.target.value)}
					className="w-full px-3 py-2.5 bg-[#161616] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
					placeholder="delete my account"
				/>
			</div>
			<div className="flex flex-col-reverse sm:flex-row gap-3">
				<button
					onClick={handleClose}
					className="flex-1 py-2.5 bg-white/10 text-white/70 font-medium rounded-lg hover:bg-white/20 transition-colors"
				>
					cancel
				</button>
				<button
					onClick={handleDelete}
					disabled={confirm !== "delete my account" || loading}
					className="flex-1 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? "deleting..." : "delete account"}
				</button>
			</div>
		</Modal>
	);
}
