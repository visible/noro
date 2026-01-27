import { invoke } from "@tauri-apps/api/core";
import { useState, useCallback } from "react";

export interface RemoteItem {
	id: string;
	type: string;
	title: string;
	data: string;
	revision: number;
	favorite: boolean;
	deleted: boolean;
	tags: { id: string; name: string }[];
}

const BASE_URL = "https://noro.sh";

export function useSync(token: string | null) {
	const [items, setItems] = useState<RemoteItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetch = useCallback(async () => {
		if (!token) return;
		setLoading(true);
		setError(null);
		try {
			const result = await invoke<RemoteItem[]>("sync_fetch", {
				baseUrl: BASE_URL,
				token,
			});
			setItems(result);
		} catch (e) {
			setError(String(e));
		} finally {
			setLoading(false);
		}
	}, [token]);

	const create = useCallback(
		async (
			itemType: string,
			title: string,
			data: string,
			tags: string[] = [],
			favorite = false,
		) => {
			if (!token) throw new Error("not authenticated");
			setLoading(true);
			setError(null);
			try {
				const item = await invoke<RemoteItem>("sync_create", {
					baseUrl: BASE_URL,
					token,
					itemType,
					title,
					data,
					tags,
					favorite,
				});
				setItems((prev) => [item, ...prev]);
				return item;
			} catch (e) {
				setError(String(e));
				throw e;
			} finally {
				setLoading(false);
			}
		},
		[token],
	);

	const update = useCallback(
		async (
			id: string,
			updates: {
				title?: string;
				data?: string;
				tags?: string[];
				favorite?: boolean;
			},
		) => {
			if (!token) throw new Error("not authenticated");
			setLoading(true);
			setError(null);
			try {
				const item = await invoke<RemoteItem>("sync_update", {
					baseUrl: BASE_URL,
					token,
					id,
					...updates,
				});
				setItems((prev) => prev.map((i) => (i.id === id ? item : i)));
				return item;
			} catch (e) {
				setError(String(e));
				throw e;
			} finally {
				setLoading(false);
			}
		},
		[token],
	);

	const remove = useCallback(
		async (id: string) => {
			if (!token) throw new Error("not authenticated");
			setLoading(true);
			setError(null);
			try {
				await invoke<boolean>("sync_delete", {
					baseUrl: BASE_URL,
					token,
					id,
				});
				setItems((prev) => prev.filter((i) => i.id !== id));
			} catch (e) {
				setError(String(e));
				throw e;
			} finally {
				setLoading(false);
			}
		},
		[token],
	);

	return {
		items,
		loading,
		error,
		fetch,
		create,
		update,
		remove,
	};
}
