import type { FolderData, FolderIcon } from "./types";

const STORAGE_KEY = "noro_folders";

export type FolderColor = "default" | "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink";

export interface Folder {
	id: string;
	name: string;
	parentId: string | null;
	userId: string;
	color: FolderColor;
	icon: FolderIcon;
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface FolderTree extends Folder {
	children: FolderTree[];
	itemCount: number;
}

export function load(): Folder[] {
	if (typeof window === "undefined") return [];
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		return data ? JSON.parse(data) : [];
	} catch {
		return [];
	}
}

export function save(folders: Folder[]) {
	if (typeof window === "undefined") return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
}

export function create(input: { name: string; parentId?: string | null; userId: string; color?: FolderColor; icon?: FolderIcon }): Folder {
	const folders = load();
	const now = new Date().toISOString();
	const siblings = folders.filter((f) => f.parentId === (input.parentId || null));
	const maxOrder = siblings.reduce((max, f) => Math.max(max, f.order), -1);
	const folder: Folder = {
		id: crypto.randomUUID(),
		name: input.name,
		parentId: input.parentId || null,
		userId: input.userId,
		color: input.color || "default",
		icon: input.icon || "folder",
		order: maxOrder + 1,
		createdAt: now,
		updatedAt: now,
	};
	folders.push(folder);
	save(folders);
	return folder;
}

export function update(id: string, updates: Partial<Pick<Folder, "name" | "parentId" | "color" | "icon" | "order">>): Folder | null {
	const folders = load();
	const index = folders.findIndex((f) => f.id === id);
	if (index === -1) return null;
	if (updates.parentId !== undefined && (updates.parentId === id || checkCycle(folders, id, updates.parentId))) return null;
	folders[index] = { ...folders[index], ...updates, updatedAt: new Date().toISOString() };
	save(folders);
	return folders[index];
}

export function remove(id: string): { deleted: string[]; orphanedItems: boolean } {
	const folders = load();
	const toDelete = [id, ...collectDescendants(folders, id)];
	save(folders.filter((f) => !toDelete.includes(f.id)));
	return { deleted: toDelete, orphanedItems: toDelete.length > 0 };
}

export function get(id: string): Folder | null {
	return load().find((f) => f.id === id) || null;
}

export function list(userId: string): Folder[] {
	return load().filter((f) => f.userId === userId);
}

export function buildTree(folders: Folder[], counts: Record<string, number> = {}): FolderTree[] {
	const map = new Map<string | null, FolderTree[]>();
	folders.forEach((folder) => {
		const tree: FolderTree = { ...folder, children: [], itemCount: counts[folder.id] || 0 };
		if (!map.has(folder.parentId)) map.set(folder.parentId, []);
		map.get(folder.parentId)!.push(tree);
	});
	function attach(parent: FolderTree) {
		const children = map.get(parent.id) || [];
		children.sort((a, b) => a.order - b.order);
		parent.children = children;
		children.forEach(attach);
	}
	const roots = map.get(null) || [];
	roots.sort((a, b) => a.order - b.order);
	roots.forEach(attach);
	return roots;
}

export function reorder(id: string, newOrder: number, newParentId: string | null): boolean {
	const folders = load();
	const folder = folders.find((f) => f.id === id);
	if (!folder) return false;
	const oldParent = folder.parentId;
	folder.parentId = newParentId;
	folder.order = newOrder;
	folder.updatedAt = new Date().toISOString();
	const siblings = folders.filter((f) => f.parentId === newParentId && f.id !== id).sort((a, b) => a.order - b.order);
	siblings.splice(newOrder, 0, folder);
	siblings.forEach((f, i) => { f.order = i; });
	if (oldParent !== newParentId) {
		folders.filter((f) => f.parentId === oldParent && f.id !== id).sort((a, b) => a.order - b.order).forEach((f, i) => { f.order = i; });
	}
	save(folders);
	return true;
}

export function moveItems(itemIds: string[], folderId: string | null): void {
	if (typeof window === "undefined") return;
	const key = "noro_vault_items";
	try {
		const data = localStorage.getItem(key);
		if (!data) return;
		const items = JSON.parse(data);
		const updated = items.map((item: { id: string; folderId: string | null }) =>
			itemIds.includes(item.id) ? { ...item, folderId, updatedAt: new Date().toISOString() } : item
		);
		localStorage.setItem(key, JSON.stringify(updated));
	} catch { return; }
}

export function toFolderData(folder: Folder): FolderData {
	return { id: folder.id, name: folder.name, parentId: folder.parentId, icon: folder.icon, createdAt: folder.createdAt, updatedAt: folder.updatedAt };
}

function checkCycle(folders: Folder[], id: string, newParentId: string | null): boolean {
	if (!newParentId) return false;
	let current: string | null = newParentId;
	const visited = new Set<string>();
	while (current) {
		if (current === id || visited.has(current)) return true;
		visited.add(current);
		const parent = folders.find((f) => f.id === current);
		current = parent?.parentId || null;
	}
	return false;
}

function collectDescendants(folders: Folder[], parentId: string): string[] {
	const children = folders.filter((f) => f.parentId === parentId);
	const ids: string[] = [];
	children.forEach((child) => { ids.push(child.id, ...collectDescendants(folders, child.id)); });
	return ids;
}
