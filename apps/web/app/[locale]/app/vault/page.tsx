"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { ItemType } from "@/lib/generated/prisma/enums";
import type { SpecialFolder } from "@/lib/types";
import type { VaultItem } from "./store";
import * as store from "./store";
import { SearchBar } from "./search";
import { TypeFilters } from "./filters";
import { VaultListItem } from "./item";
import { ItemModal } from "./modal";

export default function Vault() {
	const searchParams = useSearchParams();
	const folder = (searchParams.get("folder") || "all") as string | SpecialFolder;
	const [items, setItems] = useState<VaultItem[]>([]);
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState<ItemType | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [editingItem, setEditingItem] = useState<VaultItem | null>(null);

	useEffect(() => {
		setItems(store.filter(folder, typeFilter));
	}, [folder, typeFilter]);

	const counts = useMemo(() => {
		const c: Record<ItemType, number> = {
			login: 0, note: 0, card: 0, identity: 0, ssh: 0, api: 0, otp: 0, passkey: 0,
		};
		items.forEach((item) => c[item.type]++);
		return c;
	}, [items]);

	const filtered = useMemo(() => {
		let result = items;
		if (search) {
			const q = search.toLowerCase();
			result = result.filter((i) =>
				i.title.toLowerCase().includes(q) ||
				i.tags.some((t) => t.toLowerCase().includes(q))
			);
		}
		return result.sort((a, b) => {
			if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
			return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
		});
	}, [items, search]);

	function reload() {
		setItems(store.filter(folder, typeFilter));
	}

	function handleSave(data: { type: ItemType; title: string; data: Record<string, unknown>; tags: string[] }) {
		if (editingItem) {
			store.update(editingItem.id, data);
		} else {
			store.create({ ...data, favorite: false, folderId: folder === "all" || folder === "favorites" || folder === "trash" ? null : folder });
		}
		reload();
		setShowModal(false);
		setEditingItem(null);
	}

	function handleDelete() {
		if (editingItem) {
			if (folder === "trash") {
				store.remove(editingItem.id);
			} else {
				store.softDelete(editingItem.id);
			}
			reload();
			setShowModal(false);
			setEditingItem(null);
		}
	}

	function handleRestore() {
		if (editingItem) {
			store.restore(editingItem.id);
			reload();
			setShowModal(false);
			setEditingItem(null);
		}
	}

	function handleFavorite(id: string) {
		store.toggleFavorite(id);
		reload();
	}

	const isTrash = folder === "trash";
	const title = folder === "all" ? "all items" : folder === "favorites" ? "favorites" : folder === "trash" ? "trash" : "vault";

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">{title}</h1>
				{!isTrash && (
					<button
						onClick={() => { setEditingItem(null); setShowModal(true); }}
						className="px-4 py-2 bg-[#FF6B00] text-black font-semibold rounded-lg hover:bg-[#FF6B00]/90 transition-colors"
					>
						+ add item
					</button>
				)}
			</div>

			<div className="space-y-4 mb-6">
				<SearchBar value={search} onChange={setSearch} />
				{!isTrash && <TypeFilters selected={typeFilter} onSelect={setTypeFilter} counts={counts} />}
			</div>

			{filtered.length === 0 ? (
				<div className="text-center py-16">
					{items.length === 0 && !isTrash ? (
						<>
							<p className="text-white/40 mb-4">no items yet</p>
							<p className="text-white/20 text-sm">add your first password, note, or card</p>
						</>
					) : isTrash && items.length === 0 ? (
						<p className="text-white/40">trash is empty</p>
					) : (
						<p className="text-white/40">no items match your search</p>
					)}
				</div>
			) : (
				<div className="space-y-2">
					{filtered.map((item) => (
						<VaultListItem
							key={item.id}
							item={item}
							onClick={() => { setEditingItem(item); setShowModal(true); }}
							onFavorite={() => handleFavorite(item.id)}
						/>
					))}
				</div>
			)}

			{showModal && (
				<ItemModal
					item={editingItem}
					onSave={handleSave}
					onDelete={editingItem ? handleDelete : undefined}
					onRestore={editingItem && isTrash ? handleRestore : undefined}
					onClose={() => { setShowModal(false); setEditingItem(null); }}
					isTrash={isTrash}
				/>
			)}
		</div>
	);
}
