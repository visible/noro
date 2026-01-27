"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { ItemType } from "@/lib/generated/prisma/enums";
import type { SpecialFolder } from "@/lib/types";
import type { VaultItem } from "./store";
import type { LoginData } from "@/lib/types";
import * as store from "./store";
import { SearchBar } from "./search";
import { TypeFilters } from "./filters";
import { VaultListItem } from "./item";
import { ItemModal } from "./modal";
import { TagFilter } from "@/components/tags";
import { useSidebar } from "@/components/sidebar";

const itemtypes: ItemType[] = ["login", "note", "card", "identity", "ssh", "api", "otp", "passkey"];

export default function Vault() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { register, selectedItem, setSelectedItem } = useSidebar();
	const folder = (searchParams.get("folder") || "all") as string | SpecialFolder;
	const newitemtype = searchParams.get("newitem") as ItemType | null;
	const itemid = searchParams.get("item");
	const [items, setItems] = useState<VaultItem[]>([]);
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState<ItemType | null>(null);
	const [tagFilter, setTagFilter] = useState<string | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
	const [defaulttype, setDefaulttype] = useState<ItemType | undefined>(undefined);
	const searchRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setItems(store.filter(folder, typeFilter));
	}, [folder, typeFilter]);

	useEffect(() => {
		if (newitemtype && itemtypes.includes(newitemtype)) {
			setDefaulttype(newitemtype);
			setEditingItem(null);
			setShowModal(true);
			router.replace("/app");
		}
	}, [newitemtype, router]);

	useEffect(() => {
		if (itemid) {
			const item = store.get(itemid);
			if (item) {
				setEditingItem(item);
				setShowModal(true);
			}
			router.replace("/app");
		}
	}, [itemid, router]);

	const copyPassword = useCallback(() => {
		if (!selectedItem) return;
		const item = store.get(selectedItem);
		if (!item || item.type !== "login") return;
		const data = item.data as LoginData;
		if (data.password) {
			navigator.clipboard.writeText(data.password);
		}
	}, [selectedItem]);

	const openNewItem = useCallback(() => {
		if (folder !== "trash") {
			setEditingItem(null);
			setShowModal(true);
		}
	}, [folder]);

	const focusSearch = useCallback(() => {
		searchRef.current?.focus();
	}, []);

	const closeModal = useCallback(() => {
		if (showModal) {
			setShowModal(false);
			setEditingItem(null);
		}
	}, [showModal]);

	useEffect(() => {
		register("new", openNewItem);
		register("search", focusSearch);
		register("copy", copyPassword);
		register("escape", closeModal);
		return () => {
			register("new", null);
			register("search", null);
			register("copy", null);
			register("escape", null);
		};
	}, [register, openNewItem, focusSearch, copyPassword, closeModal]);

	const counts = useMemo(() => {
		const c: Record<ItemType, number> = {
			login: 0, note: 0, card: 0, identity: 0, ssh: 0, api: 0, otp: 0, passkey: 0,
		};
		items.forEach((item) => c[item.type]++);
		return c;
	}, [items]);

	const allTags = useMemo(() => {
		const set = new Set<string>();
		items.forEach((item) => item.tags.forEach((t) => set.add(t)));
		return Array.from(set).sort();
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
		if (tagFilter) {
			result = result.filter((i) => i.tags.includes(tagFilter));
		}
		return result.sort((a, b) => {
			if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
			return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
		});
	}, [items, search, tagFilter]);

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
			<div className="flex items-center justify-between gap-4 mb-6">
				<h1 className="text-xl sm:text-2xl font-bold truncate">{title}</h1>
				{!isTrash && (
					<button
						onClick={() => { setEditingItem(null); setShowModal(true); }}
						className="shrink-0 px-3 sm:px-4 py-2.5 bg-[#FF6B00] text-black font-semibold rounded-lg hover:bg-[#FF6B00]/90 active:bg-[#FF6B00]/80 transition-colors min-h-[44px] text-sm sm:text-base"
					>
						<span className="sm:hidden">+ add</span>
						<span className="hidden sm:inline">+ add item</span>
					</button>
				)}
			</div>

			<div className="space-y-4 mb-6">
				<SearchBar ref={searchRef} value={search} onChange={setSearch} />
				{!isTrash && <TypeFilters selected={typeFilter} onSelect={setTypeFilter} counts={counts} />}
				{!isTrash && <TagFilter tags={allTags} selected={tagFilter} onSelect={setTagFilter} />}
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
							onTagClick={setTagFilter}
						/>
					))}
				</div>
			)}

			{showModal && (
				<ItemModal
					item={editingItem}
					defaulttype={defaulttype}
					onSave={handleSave}
					onDelete={editingItem ? handleDelete : undefined}
					onRestore={editingItem && isTrash ? handleRestore : undefined}
					onClose={() => { setShowModal(false); setEditingItem(null); setDefaulttype(undefined); }}
					isTrash={isTrash}
				/>
			)}
		</div>
	);
}
