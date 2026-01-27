"use client";

import { useState, useEffect } from "react";
import { Section, Card, Row, Toggle, Select, ButtonRow } from "@/components/settings";
import { DeleteModal } from "./delete";
import { PasswordModal } from "./password";

interface User {
	id: string;
	email: string;
	name: string | null;
	createdAt: string;
}

const timeoutOptions = [
	{ value: "5", label: "5 minutes" },
	{ value: "15", label: "15 minutes" },
	{ value: "30", label: "30 minutes" },
	{ value: "60", label: "1 hour" },
	{ value: "240", label: "4 hours" },
	{ value: "1440", label: "24 hours" },
];

const clipboardOptions = [
	{ value: "0", label: "never" },
	{ value: "30", label: "30 seconds" },
	{ value: "60", label: "1 minute" },
	{ value: "120", label: "2 minutes" },
	{ value: "300", label: "5 minutes" },
];

export default function Settings() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const [sessionTimeout, setSessionTimeout] = useState("30");
	const [twoFactor, setTwoFactor] = useState(false);
	const [autoLock, setAutoLock] = useState("15");
	const [clearClipboard, setClearClipboard] = useState("30");
	const [theme, setTheme] = useState("dark");

	const [deleteModal, setDeleteModal] = useState(false);
	const [passwordModal, setPasswordModal] = useState(false);

	useEffect(() => {
		async function load() {
			try {
				const res = await fetch("/api/auth/me");
				const data = await res.json();
				setUser(data.user);
			} catch {
				console.error("failed to load user");
			} finally {
				setLoading(false);
			}
		}
		load();
	}, []);

	async function handleExport() {
		try {
			const res = await fetch("/api/v1/vault/export");
			const data = await res.json();
			const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `noro-export-${new Date().toISOString().split("T")[0]}.json`;
			a.click();
			URL.revokeObjectURL(url);
		} catch {
			console.error("failed to export");
		}
	}

	if (loading) {
		return <div className="text-white/40">loading...</div>;
	}

	return (
		<div className="max-w-xl">
			<h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">settings</h1>

			<Section title="account">
				<Card>
					<Row label="email" description="your login email">
						<span className="text-white/60">{user?.email}</span>
					</Row>
					<Row label="name">
						<span className="text-white/60">{user?.name || "not set"}</span>
					</Row>
					<Row label="member since">
						<span className="text-white/60">
							{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
						</span>
					</Row>
				</Card>
				<div className="mt-3">
					<ButtonRow
						label="change password"
						description="update your master password"
						onClick={() => setPasswordModal(true)}
					/>
				</div>
			</Section>

			<Section title="security">
				<Card>
					<Select
						label="session timeout"
						description="auto logout after inactivity"
						value={sessionTimeout}
						options={timeoutOptions}
						onChange={setSessionTimeout}
					/>
					<Toggle
						label="two-factor authentication"
						description="add an extra layer of security"
						checked={twoFactor}
						onChange={setTwoFactor}
					/>
				</Card>
				<div className="mt-3 space-y-3">
					<ButtonRow label="view recovery codes" description="regenerate your backup codes" onClick={() => {}} />
					<ButtonRow label="active sessions" description="manage your logged in devices" onClick={() => {}} />
				</div>
			</Section>

			<Section title="vault">
				<Card>
					<Select
						label="auto-lock timer"
						description="lock vault after inactivity"
						value={autoLock}
						options={timeoutOptions}
						onChange={setAutoLock}
					/>
					<Select
						label="clear clipboard"
						description="auto-clear copied secrets"
						value={clearClipboard}
						options={clipboardOptions}
						onChange={setClearClipboard}
					/>
				</Card>
			</Section>

			<Section title="appearance">
				<Card>
					<Select
						label="theme"
						description="choose your preferred theme"
						value={theme}
						options={[
							{ value: "dark", label: "dark" },
							{ value: "light", label: "light" },
							{ value: "system", label: "system" },
						]}
						onChange={setTheme}
					/>
				</Card>
			</Section>

			<Section title="data">
				<div className="space-y-3">
					<ButtonRow label="export vault" description="download your data as json" onClick={handleExport} />
					<ButtonRow label="import data" description="import from 1password, bitwarden, etc" onClick={() => {}} />
				</div>
			</Section>

			<Section title="danger zone" variant="danger">
				<ButtonRow
					label="delete account"
					description="permanently delete your account and all data"
					variant="danger"
					onClick={() => setDeleteModal(true)}
				/>
			</Section>

			<DeleteModal open={deleteModal} onClose={() => setDeleteModal(false)} />
			<PasswordModal open={passwordModal} onClose={() => setPasswordModal(false)} />
		</div>
	);
}
