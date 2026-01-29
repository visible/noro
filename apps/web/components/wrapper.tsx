"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ItemType } from "@/lib/generated/prisma/enums";
import { Command } from "./command";
import { Export } from "./export";
import { signOut } from "@/lib/client";
import * as store from "@/app/[locale]/vault/vault/store";
import type { VaultItem } from "@/app/[locale]/vault/vault/store";

interface Props {
	onitemcreate?: (type: ItemType) => void;
}

export function CommandWrapper({ onitemcreate }: Props) {
	const [showexport, setShowexport] = useState(false);
	const [items, setItems] = useState<VaultItem[]>([]);
	const router = useRouter();

	useEffect(() => {
		store.load().then((data) => setItems(data.filter((i) => !i.deleted)));
	}, []);

	function handleexport() {
		setShowexport(true);
	}

	async function handlelock() {
		await signOut();
		router.push("/login");
	}

	function handlenewitem(type: ItemType) {
		if (onitemcreate) {
			onitemcreate(type);
		} else {
			router.push(`/vault?newitem=${type}`);
		}
	}

	const exportitems = items.map((item) => ({
		id: item.id,
		type: item.type,
		title: item.title,
		data: item.data,
		favorite: item.favorite,
		tags: item.tags,
		created: item.createdAt,
		updated: item.updatedAt,
	}));

	return (
		<>
			<Command onnewitem={handlenewitem} onexport={handleexport} onlock={handlelock} />
			<Export items={exportitems} open={showexport} onclose={() => setShowexport(false)} />
		</>
	);
}
