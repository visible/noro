import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ItemType =
	| "login"
	| "note"
	| "card"
	| "identity"
	| "ssh"
	| "api"
	| "otp"
	| "passkey";

export type FolderIcon =
	| "folder"
	| "star"
	| "archive"
	| "lock"
	| "globe"
	| "code"
	| "key"
	| "user";

export type Folder = {
	id: string;
	name: string;
	parentId: string | null;
	icon: FolderIcon;
	createdAt: string;
	updatedAt: string;
};

export type VaultItem = {
	id: string;
	type: ItemType;
	title: string;
	data: Record<string, unknown>;
	tags: string[];
	favorite: boolean;
	folderId: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

export type CreateItemInput = {
	type: ItemType;
	title: string;
	data: Record<string, unknown>;
	tags?: string[];
	favorite?: boolean;
	folderId?: string | null;
};

export type UpdateItemInput = {
	title?: string;
	data?: Record<string, unknown>;
	tags?: string[];
	favorite?: boolean;
	folderId?: string | null;
};

type VaultState = {
	items: VaultItem[];
	folders: Folder[];
	loading: boolean;
	error: string | null;
	searchQuery: string;
	selectedType: ItemType | null;
	selectedFolder: string | null;
	setSearchQuery: (query: string) => void;
	setSelectedType: (type: ItemType | null) => void;
	setSelectedFolder: (folderId: string | null) => void;
	fetch: () => Promise<void>;
	create: (input: CreateItemInput) => Promise<void>;
	update: (id: string, input: UpdateItemInput) => Promise<void>;
	delete: (id: string) => Promise<void>;
	getFiltered: () => VaultItem[];
	setItems: (items: VaultItem[]) => void;
	setFolders: (folders: Folder[]) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
};

import { gettoken } from "../lib/storage";

const baseurl = process.env.EXPO_PUBLIC_API_URL || "https://noro.sh/api";

async function authfetch(path: string, options: RequestInit = {}) {
	const token = await gettoken();
	const headers: Record<string, string> = {
		"content-type": "application/json",
		...(options.headers as Record<string, string>),
	};
	if (token) {
		headers["authorization"] = `Bearer ${token}`;
	}
	return fetch(`${baseurl}${path}`, { ...options, headers });
}

export const usevault = create<VaultState>()(
	persist(
		(set, get) => ({
			items: [],
			folders: [],
			loading: false,
			error: null,
			searchQuery: "",
			selectedType: null,
			selectedFolder: null,

			setSearchQuery: (query) => set({ searchQuery: query }),
			setSelectedType: (type) => set({ selectedType: type }),
			setSelectedFolder: (folderId) => set({ selectedFolder: folderId }),
			setItems: (items) => set({ items }),
			setFolders: (folders) => set({ folders }),
			setLoading: (loading) => set({ loading }),
			setError: (error) => set({ error }),

			fetch: async () => {
				set({ loading: true, error: null });
				try {
					const res = await authfetch("/v1/vault/items");
					if (!res.ok) throw new Error("failed to fetch");
					const data = await res.json();
					set({ items: data.items || [], loading: false });
				} catch (err) {
					set({
						error: err instanceof Error ? err.message : "unknown error",
						loading: false,
					});
				}
			},

			create: async (input) => {
				set({ loading: true, error: null });
				try {
					const res = await authfetch("/v1/vault/items", {
						method: "POST",
						body: JSON.stringify(input),
					});
					if (!res.ok) throw new Error("failed to create");
					const data = await res.json();
					set((state) => ({
						items: [...state.items, data.item],
						loading: false,
					}));
				} catch (err) {
					set({
						error: err instanceof Error ? err.message : "unknown error",
						loading: false,
					});
				}
			},

			update: async (id, input) => {
				set({ loading: true, error: null });
				try {
					const res = await authfetch(`/v1/vault/items/${id}`, {
						method: "PATCH",
						body: JSON.stringify(input),
					});
					if (!res.ok) throw new Error("failed to update");
					const data = await res.json();
					set((state) => ({
						items: state.items.map((item) =>
							item.id === id ? { ...item, ...data.item } : item
						),
						loading: false,
					}));
				} catch (err) {
					set({
						error: err instanceof Error ? err.message : "unknown error",
						loading: false,
					});
				}
			},

			delete: async (id) => {
				set({ loading: true, error: null });
				try {
					const res = await authfetch(`/v1/vault/items/${id}`, {
						method: "DELETE",
					});
					if (!res.ok) throw new Error("failed to delete");
					set((state) => ({
						items: state.items.filter((item) => item.id !== id),
						loading: false,
					}));
				} catch (err) {
					set({
						error: err instanceof Error ? err.message : "unknown error",
						loading: false,
					});
				}
			},

			getFiltered: () => {
				const state = get();
				let filtered = state.items.filter((item) => !item.deletedAt);

				if (state.searchQuery) {
					const query = state.searchQuery.toLowerCase();
					filtered = filtered.filter(
						(item) =>
							item.title.toLowerCase().includes(query) ||
							item.tags.some((tag) => tag.toLowerCase().includes(query))
					);
				}

				if (state.selectedType) {
					filtered = filtered.filter(
						(item) => item.type === state.selectedType
					);
				}

				if (state.selectedFolder) {
					filtered = filtered.filter(
						(item) => item.folderId === state.selectedFolder
					);
				}

				return filtered;
			},
		}),
		{
			name: "vault",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				items: state.items,
				folders: state.folders,
			}),
		}
	)
);
