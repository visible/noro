"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { Folders } from "@/components/folders";
import { signOut } from "@/lib/client";
import type { FolderData, SpecialFolder } from "@/lib/types";

interface User {
	id: string;
	email: string;
	name: string;
	image?: string | null;
}

interface Props {
	user: User;
}

const navItems = [
	{ href: "/app", label: "vault", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
	{ href: "/app/generator", label: "generator", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
	{ href: "/app/settings", label: "settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export function Sidebar({ user }: Props) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [folders, setFolders] = useState<FolderData[]>([]);
	const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
	const [favoriteCount, setFavoriteCount] = useState(0);
	const [trashCount, setTrashCount] = useState(0);
	const [totalCount, setTotalCount] = useState(0);

	const isVaultPage = pathname.endsWith("/app") || pathname.endsWith("/app/");
	const currentFolder = searchParams.get("folder") || "all";

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
			console.error("failed to load folders");
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
			console.error("failed to load counts");
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
		} catch {
			console.error("failed to create folder");
		}
	}

	async function handleRenameFolder(id: string, name: string) {
		try {
			await fetch(`/api/v1/vault/folders/${id}`, {
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ name }),
			});
			setFolders(folders.map((f) => (f.id === id ? { ...f, name } : f)));
		} catch {
			console.error("failed to rename folder");
		}
	}

	async function handleDeleteFolder(id: string) {
		try {
			await fetch(`/api/v1/vault/folders/${id}`, { method: "DELETE" });
			setFolders(folders.filter((f) => f.id !== id));
			if (currentFolder === id) {
				router.push("/app");
			}
		} catch {
			console.error("failed to delete folder");
		}
	}

	async function handleMoveItem(itemId: string, folderId: string | null) {
		try {
			await fetch(`/api/v1/vault/items/${itemId}`, {
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ folderId }),
			});
			loadCounts();
		} catch {
			console.error("failed to move item");
		}
	}

	function handleSelectFolder(id: string | SpecialFolder) {
		if (id === "all") {
			router.push("/app");
		} else {
			router.push(`/app?folder=${id}`);
		}
	}

	async function handleLogout() {
		await signOut();
		router.push("/");
	}

	return (
		<aside className="w-64 border-r border-white/10 flex flex-col">
			<div className="p-6">
				<Link href="/" className="block mb-8">
					<Logo />
				</Link>

				<nav className="space-y-1">
					{navItems.map((item) => {
						const isActive = pathname.endsWith(item.href) || pathname.endsWith(item.href + "/");
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
									isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
								}`}
							>
								<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
									<path d={item.icon} />
								</svg>
								{item.label}
							</Link>
						);
					})}
				</nav>
			</div>

			{isVaultPage && (
				<div className="flex-1 overflow-y-auto px-3 pb-4">
					<Folders
						folders={folders}
						selected={currentFolder as string | SpecialFolder}
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
			)}

			<div className="mt-auto p-6 border-t border-white/10">
				<div className="px-4 mb-4">
					<p className="text-sm font-medium truncate">{user.name || user.email}</p>
					<p className="text-xs text-white/40 truncate">{user.email}</p>
				</div>
				<button
					onClick={handleLogout}
					className="w-full px-4 py-2 text-left text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
				>
					sign out
				</button>
			</div>
		</aside>
	);
}
