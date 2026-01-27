"use client";

import { useState } from "react";
import { useSession } from "@/lib/client";
import { Section, Card, Row, Toggle, Select, ButtonRow } from "@/components/settings";
import { DeleteModal } from "./delete";
import { PasswordModal } from "./password";

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
	const { data: session, isPending: loading } = useSession();
	const user = session?.user;

	const [sessionTimeout, setSessionTimeout] = useState("30");
	const [twoFactor, setTwoFactor] = useState(false);
	const [autoLock, setAutoLock] = useState("15");
	const [clearClipboard, setClearClipboard] = useState("30");
	const [theme, setTheme] = useState("dark");

	const [deleteModal, setDeleteModal] = useState(false);
	const [passwordModal, setPasswordModal] = useState(false);

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
		return (
			<div className="min-h-screen bg-stone-950 -m-4 md:-m-8 p-4 md:p-8">
				<div className="max-w-2xl mx-auto">
					<div className="animate-pulse">
						<div className="h-8 bg-white/10 rounded w-32 mb-2" />
						<div className="h-4 bg-white/10 rounded w-64" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-stone-950 -m-4 md:-m-8 p-4 md:p-8">
			<div className="max-w-2xl mx-auto">
				<header className="mb-8">
					<h1 className="text-2xl font-semibold text-white">settings</h1>
					<p className="text-white/50 mt-1">manage your account and preferences</p>
				</header>

				<Section title="profile" description="your account information">
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
				</Section>

				<Section title="security" description="protect your account">
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
						<ButtonRow
							label="change password"
							description="update your master password"
							onClick={() => setPasswordModal(true)}
						/>
						<ButtonRow label="view recovery codes" description="regenerate your backup codes" onClick={() => {}} />
						<ButtonRow label="active sessions" description="manage your logged in devices" onClick={() => {}} />
					</div>
				</Section>

				<Section title="vault" description="configure vault behavior">
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

				<Section title="appearance" description="customize the interface">
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

				<Section title="data" description="export and import your vault">
					<div className="space-y-3">
						<ButtonRow label="export vault" description="download your data as json" onClick={handleExport} />
						<ButtonRow label="import data" description="import from 1password, bitwarden, etc" onClick={() => {}} />
					</div>
				</Section>

				<Section title="danger zone" description="irreversible actions" variant="danger">
					<Card variant="danger">
						<Row label="delete account" description="permanently delete your account and all data">
							<button
								onClick={() => setDeleteModal(true)}
								className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
							>
								delete
							</button>
						</Row>
					</Card>
				</Section>

				<DeleteModal open={deleteModal} onClose={() => setDeleteModal(false)} />
				<PasswordModal open={passwordModal} onClose={() => setPasswordModal(false)} />
			</div>
		</div>
	);
}
