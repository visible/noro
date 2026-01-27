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
			<p className="text-white/60 mb-4">
				this action is permanent and cannot be undone. all your vault items, api keys, and data will be
				deleted.
			</p>
			<p className="text-sm text-white/40 mb-4">
				we recommend exporting your data before deleting your account.
			</p>
			<div className="mb-4">
				<label className="block text-sm text-white/60 mb-2">
					type &quot;delete my account&quot; to confirm
				</label>
				<input
					type="text"
					value={confirm}
					onChange={(e) => setConfirm(e.target.value)}
					className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-base"
					placeholder="delete my account"
				/>
			</div>
			<div className="flex flex-col-reverse sm:flex-row gap-3">
				<button
					onClick={handleClose}
					className="flex-1 py-3 bg-white/10 rounded-lg hover:bg-white/20 active:bg-white/25 transition-colors min-h-[48px]"
				>
					cancel
				</button>
				<button
					onClick={handleDelete}
					disabled={confirm !== "delete my account" || loading}
					className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
				>
					{loading ? "deleting..." : "delete"}
				</button>
			</div>
		</Modal>
	);
}
