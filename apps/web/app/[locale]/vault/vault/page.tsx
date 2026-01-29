"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { ItemType } from "@/lib/generated/prisma/enums";
import type { FolderData, SpecialFolder } from "@/lib/types";
import type { VaultItem } from "./store";
import type { LoginData } from "@/lib/types";
import * as store from "./store";
import { SearchBar } from "./search";
import { TypeFilters } from "./filters";
import { VaultTable } from "./table";
import { ItemModal } from "./modal";
import { TagFilter } from "./tags";
import { Folders } from "@/components/folders";
import { useSidebar } from "@/components/sidebar";

const itemtypes: ItemType[] = ["login", "note", "card", "identity", "ssh", "api", "otp", "passkey"];

export default function Vault() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { register } = useSidebar();
	const folder = (searchParams.get("folder") || "all") as string | SpecialFolder;
	const newitemtype = searchParams.get("newitem") as ItemType | null;
	const itemid = searchParams.get("item");
	const [items, setItems] = useState<VaultItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState<ItemType | null>(null);
	const [tagFilter, setTagFilter] = useState<string | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
	const [defaulttype, setDefaulttype] = useState<ItemType | undefined>(undefined);
	const [saving, setSaving] = useState(false);
	const searchRef = useRef<HTMLInputElement>(null);

	const [folders, setFolders] = useState<FolderData[]>([]);
	const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
	const [favoriteCount, setFavoriteCount] = useState(0);
	const [trashCount, setTrashCount] = useState(0);
	const [totalCount, setTotalCount] = useState(0);

	useEffect(() => {
		loadFolders();
		loadCounts();
	}, []);

	async function loadFolders() {
		try {
			const res = await fetch("/api/v1/vault/folders");
			const data = await res.json();
			setFolders(data.folders || []);
		} catch {
			setFolders([]);
		}
	}

	async function loadCounts() {
		try {
			const res = await fetch("/api/v1/vault/counts");
			const data = await res.json();
			setItemCounts(data.byFolder || {});
			setFavoriteCount(data.favorites || 0);
			setTrashCount(data.trash || 0);
			setTotalCount(data.total || 0);
		} catch {
			setItemCounts({});
			setFavoriteCount(0);
			setTrashCount(0);
			setTotalCount(0);
		}
	}

	async function handleCreateFolder(name: string, parentId: string | null) {
		try {
			const res = await fetch("/api/v1/vault/folders", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ name, parentId, icon: "folder" }),
			});
			const data = await res.json();
			setFolders([...folders, data.folder]);
		} catch {}
	}

	async function handleRenameFolder(id: string, name: string) {
		try {
			await fetch(`/api/v1/vault/folders/${id}`, {
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ name }),
			});
			setFolders(folders.map((f) => (f.id === id ? { ...f, name } : f)));
		} catch {}
	}

	async function handleDeleteFolder(id: string) {
		try {
			await fetch(`/api/v1/vault/folders/${id}`, { method: "DELETE" });
			setFolders(folders.filter((f) => f.id !== id));
			if (folder === id) {
				router.push("/vault");
			}
		} catch {}
	}

	async function handleMoveItem(itemId: string, folderId: string | null) {
		try {
			await store.update(itemId, { folderId });
			await reload();
		} catch {}
	}

	function handleSelectFolder(id: string | SpecialFolder) {
		if (id === "all") {
			router.push("/vault");
		} else {
			router.push(`/vault?folder=${id}`);
		}
	}

	async function reload() {
		setLoading(true);
		try {
			const data = await store.filter(folder, typeFilter);
			setItems(data);
			await loadCounts();
		} catch {
			setItems([]);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		reload();
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
			store.get(itemid).then((item) => {
				if (item) {
					setEditingItem(item);
					setShowModal(true);
				}
			});
			router.replace("/vault");
		}
	}, [itemid, router]);

	const copyPassword = useCallback(async () => {
		const selected = items.find((i) => i.type === "login");
		if (!selected) return;
		const item = await store.get(selected.id);
		if (!item || item.type !== "login") return;
		const data = item.data as LoginData;
		if (data.password) {
			navigator.clipboard.writeText(data.password);
		}
	}, [items]);

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

	async function handleSave(data: { type: ItemType; title: string; data: Record<string, unknown>; tags: string[] }) {
		setSaving(true);
		try {
			if (editingItem) {
				await store.update(editingItem.id, data);
			} else {
				await store.create({
					...data,
					favorite: false,
					folderId: folder === "all" || folder === "favorites" || folder === "trash" ? null : folder,
				});
			}
			await reload();
			setShowModal(false);
			setEditingItem(null);
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		if (!editingItem) return;
		setSaving(true);
		try {
			if (folder === "trash") {
				await store.remove(editingItem.id);
			} else {
				await store.softdelete(editingItem.id);
			}
			await reload();
			setShowModal(false);
			setEditingItem(null);
		} finally {
			setSaving(false);
		}
	}

	async function handleRestore() {
		if (!editingItem) return;
		setSaving(true);
		try {
			await store.restore(editingItem.id);
			await reload();
			setShowModal(false);
			setEditingItem(null);
		} finally {
			setSaving(false);
		}
	}

	async function handleFavorite(id: string) {
		await store.togglefavorite(id);
		await reload();
	}

	const isTrash = folder === "trash";
	const titles: Record<string, { title: string; description: string }> = {
		all: { title: "All Items", description: "View and manage all your stored credentials" },
		favorites: { title: "Favorites", description: "Quick access to your starred items" },
		trash: { title: "Trash", description: "Deleted items are permanently removed after 30 days" },
	};
	const { title, description } = titles[folder] || { title: "Vault", description: "Secure storage for your credentials" };

	return (
		<div className="flex h-full">
			<div className="hidden md:block w-56 shrink-0 border-r border-white/[0.06] h-full overflow-y-auto scrollbar-hidden">
				<div className="p-4">
					<Folders
						folders={folders}
						selected={folder}
						onSelect={handleSelectFolder}
						onCreate={handleCreateFolder}
						onRename={handleRenameFolder}
						onDelete={handleDeleteFolder}
						onMove={handleMoveItem}
						itemCounts={itemCounts}
						favoriteCount={favoriteCount}
						trashCount={trashCount}
						totalCount={totalCount}
					/>
				</div>
			</div>
			<div className="flex-1 min-w-0 h-full overflow-y-auto scrollbar-hidden">
				<div className="p-8 max-w-5xl space-y-6">
					<header className="flex items-start justify-between gap-6">
						<div className="space-y-1">
							<h1 className="text-xl font-semibold text-white tracking-tight">{title}</h1>
							<p className="text-sm text-white/50">{description}</p>
						</div>
						{!isTrash && (
							<button
								onClick={() => { setEditingItem(null); setShowModal(true); }}
								className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white text-sm font-medium rounded-lg hover:bg-[#FF6B00]/90 transition-colors"
							>
								<svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
								</svg>
								Add Item
							</button>
						)}
					</header>

					<div className="space-y-4">
						<SearchBar ref={searchRef} value={search} onChange={setSearch} />
						<div className="flex flex-wrap items-center gap-3">
							{!isTrash && <TypeFilters selected={typeFilter} onSelect={setTypeFilter} counts={counts} />}
							{!isTrash && allTags.length > 0 && (
								<>
									<div className="w-px h-5 bg-white/[0.08]" />
									<TagFilter tags={allTags} selected={tagFilter} onSelect={setTagFilter} />
								</>
							)}
						</div>
					</div>

					{loading ? (
						<div className="text-center py-16">
							<div className="w-8 h-8 mx-auto border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
						</div>
					) : filtered.length === 0 ? (
						<div className="text-center py-16 rounded-xl border border-white/[0.06] bg-white/[0.02]">
							<div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/[0.04] flex items-center justify-center">
								<svg aria-hidden="true" className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
								</svg>
							</div>
							{items.length === 0 && !isTrash ? (
								<>
									<p className="text-white/70 font-medium mb-1">No items yet</p>
									<p className="text-white/40 text-sm">Add your first password, note, or card to get started</p>
								</>
							) : isTrash && items.length === 0 ? (
								<p className="text-white/40">Trash is empty</p>
							) : (
								<>
									<p className="text-white/70 font-medium mb-1">No results found</p>
									<p className="text-white/40 text-sm">Try adjusting your search or filters</p>
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
					saving={saving}
				/>
			)}
		</div>
	);
}
