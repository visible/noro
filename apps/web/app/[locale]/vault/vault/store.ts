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

interface ApiItem {
	id: string;
	type: ItemType;
	title: string;
	data: ItemDataMap[ItemType];
	tags: { name: string }[];
	favorite: boolean;
	folderId: string | null;
	deleted: boolean;
	createdAt: string;
	updatedAt: string;
}

function transform(item: ApiItem): VaultItem {
	return {
		...item,
		tags: item.tags.map((t) => t.name),
	};
}

export async function load(deleted = false): Promise<VaultItem[]> {
	const res = await fetch(`/api/v1/vault/items?deleted=${deleted}`);
	if (!res.ok) return [];
	const data = await res.json();
	return (data.items || []).map(transform);
}

export async function create(
	item: Omit<VaultItem, "id" | "createdAt" | "updatedAt" | "deleted">
): Promise<VaultItem | null> {
	const res = await fetch("/api/v1/vault/items", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			type: item.type,
			title: item.title,
			data: item.data,
			tags: item.tags,
			favorite: item.favorite,
			folderId: item.folderId,
		}),
	});
	if (!res.ok) return null;
	const data = await res.json();
	return transform(data.item);
}

export async function update(
	id: string,
	updates: Partial<Omit<VaultItem, "id" | "createdAt">>
): Promise<VaultItem | null> {
	const res = await fetch(`/api/v1/vault/items/${id}`, {
		method: "PATCH",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(updates),
	});
	if (!res.ok) return null;
	const data = await res.json();
	return transform(data.item);
}

export async function remove(id: string): Promise<boolean> {
	const res = await fetch(`/api/v1/vault/items/${id}`, {
		method: "DELETE",
	});
	return res.ok;
}

export async function softdelete(id: string): Promise<VaultItem | null> {
	return update(id, { deleted: true });
}

export async function restore(id: string): Promise<VaultItem | null> {
	return update(id, { deleted: false });
}

export async function get(id: string): Promise<VaultItem | null> {
	const res = await fetch(`/api/v1/vault/items/${id}`);
	if (!res.ok) return null;
	const data = await res.json();
	return transform(data.item);
}

export async function togglefavorite(id: string): Promise<VaultItem | null> {
	const item = await get(id);
	if (!item) return null;
	return update(id, { favorite: !item.favorite });
}

export async function filter(
	folder: string | SpecialFolder,
	typeFilter?: ItemType | null
): Promise<VaultItem[]> {
	const deleted = folder === "trash";
	const params = new URLSearchParams();
	params.set("deleted", String(deleted));
	if (typeFilter) params.set("type", typeFilter);

	const res = await fetch(`/api/v1/vault/items?${params}`);
	if (!res.ok) return [];
	const data = await res.json();
	let items: VaultItem[] = (data.items || []).map(transform);

	if (folder === "favorites") {
		items = items.filter((i) => i.favorite);
	} else if (folder !== "all" && folder !== "trash") {
		items = items.filter((i) => i.folderId === folder);
	}

	return items;
}
