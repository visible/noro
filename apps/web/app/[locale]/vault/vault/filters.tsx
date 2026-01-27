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
				className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-150 ${
					selected === null
						? "bg-[#FF6B00] text-white"
						: "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
				}`}
			>
				all
				<span className={`${selected === null ? "text-white/70" : "text-white/40"}`}>{total}</span>
			</button>
			{types.map((type) => {
				const count = counts[type] || 0;
				if (count === 0) return null;
				const isActive = selected === type;
				return (
					<button
						key={type}
						onClick={() => onSelect(isActive ? null : type)}
						className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-150 ${
							isActive
								? "bg-[#FF6B00] text-white"
								: "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
						}`}
					>
						<span className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-white/50"}`}>{typeIcons[type]}</span>
						{typeLabels[type]}
						<span className={`${isActive ? "text-white/70" : "text-white/40"}`}>{count}</span>
					</button>
				);
			})}
		</div>
	);
}
