"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Folders } from "@/components/folders";
import type { FolderData, SpecialFolder } from "@/lib/types";
import { useSidebar } from "./context";
import { UserDropdown } from "./dropdown";
import { SidebarNav } from "./nav";
import { SidebarFooter } from "./footer";

export { SidebarProvider, useSidebar } from "./context";
export { MobileHeader } from "./header";

interface User {
	id: string;
	email: string;
	name: string;
	image?: string | null;
}

interface Props {
	user: User;
}

export function Sidebar({ user }: Props) {
	const { open, setOpen } = useSidebar();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [folders, setFolders] = useState<FolderData[]>([]);
	const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
	const [favoriteCount, setFavoriteCount] = useState(0);
	const [trashCount, setTrashCount] = useState(0);
	const [totalCount, setTotalCount] = useState(0);

	const isVaultPage = pathname.endsWith("/vault") || pathname.endsWith("/vault/");
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
				router.push("/vault");
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
			router.push("/vault");
		} else {
			router.push(`/vault?folder=${id}`);
		}
	}

	return (
		<>
			<div
				className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-200 ${
					open ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
				onClick={() => setOpen(false)}
			/>
			<aside
				className={`fixed md:relative top-0 left-0 h-full w-60 bg-[#0f0f0f] border-r border-white/5 flex flex-col z-50 transition-transform duration-200 md:translate-x-0 ${
					open ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="p-3 border-b border-white/5">
					<div className="flex items-center gap-2">
						<UserDropdown user={user} />
						<button
							onClick={() => setOpen(false)}
							className="md:hidden w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-md transition-colors duration-150"
							aria-label="close menu"
						>
							<svg aria-hidden="true" className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto scrollbar-hidden p-3">
					<SidebarNav />
					{isVaultPage && (
						<div className="mt-6">
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
				</div>
				<SidebarFooter />
			</aside>
		</>
	);
}
