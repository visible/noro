"use client";

import type { ItemType } from "@/lib/generated/prisma/enums";
import type { ItemDataMap, SpecialFolder } from "@/lib/types";

export interface VaultItem {
	id: string;
	type: ItemType;
	title: string;
	data: ItemDataMap[ItemType];
	tags: string[];
	favorite: boolean;
	folderId: string | null;
	deleted: boolean;
	createdAt: string;
	updatedAt: string;
}

const STORAGE_KEY = "noro_vault_items";

export function load(): VaultItem[] {
	if (typeof window === "undefined") return [];
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		return data ? JSON.parse(data) : [];
	} catch {
		return [];
	}
}

export function save(items: VaultItem[]) {
	if (typeof window === "undefined") return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function create(item: Omit<VaultItem, "id" | "createdAt" | "updatedAt" | "deleted">): VaultItem {
	const items = load();
	const now = new Date().toISOString();
	const newItem: VaultItem = {
		...item,
		id: crypto.randomUUID(),
		deleted: false,
		createdAt: now,
		updatedAt: now,
	};
	items.push(newItem);
	save(items);
	return newItem;
}

export function update(id: string, updates: Partial<Omit<VaultItem, "id" | "createdAt">>): VaultItem | null {
	const items = load();
	const index = items.findIndex((i) => i.id === id);
	if (index === -1) return null;
	items[index] = {
		...items[index],
		...updates,
		updatedAt: new Date().toISOString(),
	};
	save(items);
	return items[index];
}

export function remove(id: string): boolean {
	const items = load();
	const index = items.findIndex((i) => i.id === id);
	if (index === -1) return false;
	items.splice(index, 1);
	save(items);
	return true;
}

export function softDelete(id: string): VaultItem | null {
	return update(id, { deleted: true });
}

export function restore(id: string): VaultItem | null {
	return update(id, { deleted: false });
}

export function get(id: string): VaultItem | null {
	const items = load();
	return items.find((i) => i.id === id) || null;
}

export function toggleFavorite(id: string): VaultItem | null {
	const item = get(id);
	if (!item) return null;
	return update(id, { favorite: !item.favorite });
}

export function filter(folder: string | SpecialFolder, typeFilter?: ItemType | null): VaultItem[] {
	let items = load();

	if (folder === "trash") {
		return items.filter((i) => i.deleted);
	}

	items = items.filter((i) => !i.deleted);

	if (folder === "favorites") {
		items = items.filter((i) => i.favorite);
	} else if (folder !== "all") {
		items = items.filter((i) => i.folderId === folder);
	}

	if (typeFilter) {
		items = items.filter((i) => i.type === typeFilter);
	}

	return items;
}

export function getCounts(): { total: number; favorites: number; trash: number; byFolder: Record<string, number> } {
	const items = load();
	const active = items.filter((i) => !i.deleted);
	const byFolder: Record<string, number> = {};

	active.forEach((item) => {
		if (item.folderId) {
			byFolder[item.folderId] = (byFolder[item.folderId] || 0) + 1;
		}
	});

	return {
		total: active.length,
		favorites: active.filter((i) => i.favorite).length,
		trash: items.filter((i) => i.deleted).length,
		byFolder,
	};
}
