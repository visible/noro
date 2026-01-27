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
		<div className="flex gap-1.5 flex-wrap">
			<button
				onClick={() => onSelect(null)}
				className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
					selected === null
						? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
						: "bg-zinc-800 text-zinc-400 border border-transparent hover:text-zinc-300"
				}`}
			>
				all
				<span className={`${selected === null ? "text-orange-500/70" : "text-zinc-500"}`}>{total}</span>
			</button>
			{types.map((type) => {
				const count = counts[type] || 0;
				if (count === 0) return null;
				const isActive = selected === type;
				return (
					<button
						key={type}
						onClick={() => onSelect(isActive ? null : type)}
						className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
							isActive
								? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
								: "bg-zinc-800 text-zinc-400 border border-transparent hover:text-zinc-300"
						}`}
					>
						<span className={`w-3.5 h-3.5 ${isActive ? "text-orange-500" : "text-zinc-500"}`}>{typeIcons[type]}</span>
						{typeLabels[type]}
						<span className={`${isActive ? "text-orange-500/70" : "text-zinc-500"}`}>{count}</span>
					</button>
				);
			})}
		</div>
	);
}
