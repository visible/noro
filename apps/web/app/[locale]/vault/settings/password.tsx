"use client";

import { useState } from "react";
import { Modal } from "@/components/settings";

interface Props {
	open: boolean;
	onClose: () => void;
}

export function PasswordModal({ open, onClose }: Props) {
	const [current, setCurrent] = useState("");
	const [newPass, setNewPass] = useState("");
	const [confirm, setConfirm] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit() {
		setError("");

		if (newPass !== confirm) {
			setError("passwords do not match");
			return;
		}

		if (newPass.length < 12) {
			setError("password must be at least 12 characters");
			return;
		}

		setLoading(true);

		try {
			const res = await fetch("/api/auth/change-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
			});

			if (!res.ok) {
				const data = await res.json();
				setError(data.error || "failed to change password");
				return;
			}

			handleClose();
		} catch {
			setError("something went wrong");
		} finally {
			setLoading(false);
		}
	}

	function handleClose() {
		setCurrent("");
		setNewPass("");
		setConfirm("");
		setError("");
		onClose();
	}

	return (
		<Modal open={open} onClose={handleClose} title="change password">
			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-white/70 mb-1.5">current password</label>
					<input
						type="password"
						value={current}
						onChange={(e) => setCurrent(e.target.value)}
						className="w-full px-3 py-2.5 bg-[#161616] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#d4b08c]/20 focus:border-[#d4b08c] transition-colors"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-white/70 mb-1.5">new password</label>
					<input
						type="password"
						value={newPass}
						onChange={(e) => setNewPass(e.target.value)}
						className="w-full px-3 py-2.5 bg-[#161616] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#d4b08c]/20 focus:border-[#d4b08c] transition-colors"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-white/70 mb-1.5">confirm new password</label>
					<input
						type="password"
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)}
						className="w-full px-3 py-2.5 bg-[#161616] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#d4b08c]/20 focus:border-[#d4b08c] transition-colors"
					/>
				</div>
				{error && <p className="text-red-500 text-sm">{error}</p>}
				<div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
					<button
						onClick={handleClose}
						className="flex-1 py-2.5 bg-white/10 text-white/70 font-medium rounded-lg hover:bg-white/20 transition-colors"
					>
						cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={loading || !current || !newPass || !confirm}
						className="flex-1 py-2.5 bg-[#d4b08c] text-[#0a0a0a] font-medium rounded-lg hover:bg-[#d4b08c]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "updating..." : "update password"}
					</button>
				</div>
			</div>
		</Modal>
	);
}
