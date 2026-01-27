"use client";

import type { ItemType } from "@/lib/generated/prisma/enums";
import { typeIcons, typeLabels } from "./icons";

interface Props {
	selected: ItemType | null;
	onSelect: (type: ItemType | null) => void;
	counts: Record<ItemType, number>;
}

const types: ItemType[] = ["login", "note", "card", "identity", "ssh", "api", "otp", "passkey"];

export function TypeFilters({ selected, onSelect, counts }: Props) {
	const total = Object.values(counts).reduce((a, b) => a + b, 0);

	return (
		<div className="flex gap-2 flex-wrap">
			<button
				onClick={() => onSelect(null)}
				className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-2 ${
					selected === null ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
				}`}
			>
				all
				<span className="text-xs opacity-60">{total}</span>
			</button>
			{types.map((type) => {
				const count = counts[type] || 0;
				if (count === 0) return null;
				return (
					<button
						key={type}
						onClick={() => onSelect(type)}
						className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-2 ${
							selected === type ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
						}`}
					>
						<span className="w-4 h-4">{typeIcons[type]}</span>
						{typeLabels[type]}
						<span className="text-xs opacity-60">{count}</span>
					</button>
				);
			})}
		</div>
	);
}
