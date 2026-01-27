"use client";

import { useState, useEffect } from "react";

interface User {
	id: string;
	email: string;
	name: string | null;
	createdAt: string;
}

export default function Settings() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

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

	if (loading) {
		return <div className="text-white/40">loading...</div>;
	}

	return (
		<div className="max-w-xl">
			<h1 className="text-2xl font-bold mb-8">settings</h1>

			<section className="mb-8">
				<h2 className="text-lg font-semibold mb-4">account</h2>
				<div className="bg-white/5 rounded-lg p-6 space-y-4">
					<div>
						<label className="block text-sm text-white/60 mb-1">email</label>
						<p>{user?.email}</p>
					</div>
					<div>
						<label className="block text-sm text-white/60 mb-1">name</label>
						<p>{user?.name || "not set"}</p>
					</div>
					<div>
						<label className="block text-sm text-white/60 mb-1">member since</label>
						<p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p>
					</div>
				</div>
			</section>

			<section className="mb-8">
				<h2 className="text-lg font-semibold mb-4">security</h2>
				<div className="space-y-3">
					<button className="w-full px-4 py-3 bg-white/5 rounded-lg text-left hover:bg-white/10 transition-colors">
						<p className="font-medium">change password</p>
						<p className="text-sm text-white/40">update your master password</p>
					</button>
					<button className="w-full px-4 py-3 bg-white/5 rounded-lg text-left hover:bg-white/10 transition-colors">
						<p className="font-medium">view recovery codes</p>
						<p className="text-sm text-white/40">regenerate your recovery codes</p>
					</button>
					<button className="w-full px-4 py-3 bg-white/5 rounded-lg text-left hover:bg-white/10 transition-colors">
						<p className="font-medium">active sessions</p>
						<p className="text-sm text-white/40">manage your logged in devices</p>
					</button>
				</div>
			</section>

			<section className="mb-8">
				<h2 className="text-lg font-semibold mb-4">data</h2>
				<div className="space-y-3">
					<button className="w-full px-4 py-3 bg-white/5 rounded-lg text-left hover:bg-white/10 transition-colors">
						<p className="font-medium">export vault</p>
						<p className="text-sm text-white/40">download your data as json</p>
					</button>
					<button className="w-full px-4 py-3 bg-white/5 rounded-lg text-left hover:bg-white/10 transition-colors">
						<p className="font-medium">import data</p>
						<p className="text-sm text-white/40">import from 1password, bitwarden, etc</p>
					</button>
				</div>
			</section>

			<section>
				<h2 className="text-lg font-semibold mb-4 text-red-500">danger zone</h2>
				<button className="w-full px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-left text-red-500 hover:bg-red-500/20 transition-colors">
					<p className="font-medium">delete account</p>
					<p className="text-sm text-red-500/60">permanently delete your account and all data</p>
				</button>
			</section>
		</div>
	);
}
