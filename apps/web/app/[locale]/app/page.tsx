"use client";

import { useState, useEffect } from "react";

interface Item {
	id: string;
	type: string;
	title: string;
	favorite: boolean;
	updatedAt: string;
	tags: { name: string }[];
}

const typeIcons: Record<string, string> = {
	login: "🔑",
	note: "📝",
	card: "💳",
	identity: "👤",
	ssh: "🖥️",
	api: "🔌",
	otp: "🔢",
	passkey: "🔏",
};

export default function Vault() {
	const [items, setItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			try {
				const url = filter ? `/api/v1/vault/items?type=${filter}` : "/api/v1/vault/items";
				const res = await fetch(url);
				const data = await res.json();
				setItems(data.items || []);
			} catch {
				console.error("failed to load items");
			} finally {
				setLoading(false);
			}
		}
		load();
	}, [filter]);

	const types = ["login", "note", "card", "identity", "ssh", "api", "otp", "passkey"];

	return (
		<div>
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-bold">vault</h1>
				<button className="px-4 py-2 bg-[#FF6B00] text-black font-semibold rounded-lg hover:bg-[#FF6B00]/90 transition-colors">
					+ add item
				</button>
			</div>

			<div className="flex gap-2 mb-6 flex-wrap">
				<button
					onClick={() => setFilter(null)}
					className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
						filter === null ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
					}`}
				>
					all
				</button>
				{types.map((type) => (
					<button
						key={type}
						onClick={() => setFilter(type)}
						className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
							filter === type ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
						}`}
					>
						{typeIcons[type]} {type}
					</button>
				))}
			</div>

			{loading ? (
				<div className="text-white/40">loading...</div>
			) : items.length === 0 ? (
				<div className="text-center py-16">
					<p className="text-white/40 mb-4">no items yet</p>
					<p className="text-white/20 text-sm">add your first password, note, or card</p>
				</div>
			) : (
				<div className="space-y-2">
					{items.map((item) => (
						<div
							key={item.id}
							className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
						>
							<span className="text-2xl" aria-hidden="true">
								{typeIcons[item.type] || "📄"}
							</span>
							<div className="flex-1 min-w-0">
								<p className="font-medium truncate">{item.title}</p>
								<p className="text-sm text-white/40">{item.type}</p>
							</div>
							{item.favorite && <span className="text-[#FF6B00]">★</span>}
							{item.tags.length > 0 && (
								<div className="flex gap-1">
									{item.tags.slice(0, 2).map((tag) => (
										<span
											key={tag.name}
											className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/60"
										>
											{tag.name}
										</span>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
