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
import { VaultTable } from "./table";
import { ItemModal } from "./modal";
import { TagFilter } from "./tags";
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
			router.replace("/vault");
		}
	}, [newitemtype, router]);

	useEffect(() => {
		if (itemid) {
			const item = store.get(itemid);
			if (item) {
				setEditingItem(item);
				setShowModal(true);
			}
			router.replace("/vault");
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
	const titles: Record<string, { title: string; description: string }> = {
		all: { title: "all items", description: "view and manage all your stored credentials" },
		favorites: { title: "favorites", description: "quick access to your starred items" },
		trash: { title: "trash", description: "deleted items are permanently removed after 30 days" },
	};
	const { title, description } = titles[folder] || { title: "vault", description: "secure storage for your credentials" };

	return (
		<div className="min-h-screen">
			<div className="px-6 py-8">
				<div className="mb-8">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h1 className="text-2xl font-semibold text-white">{title}</h1>
							<p className="mt-1 text-sm text-white/50">{description}</p>
						</div>
						{!isTrash && (
							<button
								onClick={() => { setEditingItem(null); setShowModal(true); }}
								className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white text-sm font-medium rounded-lg hover:bg-[#FF6B00]/90 transition-colors"
							>
								<svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
								</svg>
								add item
							</button>
						)}
					</div>
				</div>

				<div className="space-y-4 mb-6">
					<SearchBar ref={searchRef} value={search} onChange={setSearch} />
					<div className="flex flex-wrap items-center gap-3">
						{!isTrash && <TypeFilters selected={typeFilter} onSelect={setTypeFilter} counts={counts} />}
						{!isTrash && allTags.length > 0 && (
							<>
								<div className="w-px h-6 bg-white/10" />
								<TagFilter tags={allTags} selected={tagFilter} onSelect={setTagFilter} />
							</>
						)}
					</div>
				</div>

				{filtered.length === 0 ? (
					<div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
						<div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
							<svg aria-hidden="true" className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
							</svg>
						</div>
						{items.length === 0 && !isTrash ? (
							<>
								<p className="text-white/80 font-medium mb-1">no items yet</p>
								<p className="text-white/40 text-sm">add your first password, note, or card to get started</p>
							</>
						) : isTrash && items.length === 0 ? (
							<p className="text-white/50">trash is empty</p>
						) : (
							<>
								<p className="text-white/80 font-medium mb-1">no results found</p>
								<p className="text-white/40 text-sm">try adjusting your search or filters</p>
							</>
						)}
					</div>
				) : (
					<VaultTable
						items={filtered}
						onItemClick={(item) => { setEditingItem(item); setShowModal(true); }}
						onFavorite={handleFavorite}
						onTagClick={setTagFilter}
					/>
				)}
			</div>

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
