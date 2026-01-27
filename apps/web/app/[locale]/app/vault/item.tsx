"use client";

import type { VaultItem } from "./store";
import { typeIcons } from "./icons";

interface Props {
	item: VaultItem;
	onClick: () => void;
	onFavorite: () => void;
}

export function VaultListItem({ item, onClick, onFavorite }: Props) {
	return (
		<div
			onClick={onClick}
			className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
		>
			<span className="text-white/60">{typeIcons[item.type]}</span>
			<div className="flex-1 min-w-0">
				<p className="font-medium truncate">{item.title}</p>
				<p className="text-sm text-white/40">{item.type}</p>
			</div>
			<button
				onClick={(e) => {
					e.stopPropagation();
					onFavorite();
				}}
				className={`p-2 rounded-lg transition-colors ${
					item.favorite
						? "text-[#FF6B00]"
						: "text-white/20 hover:text-white/40 opacity-0 group-hover:opacity-100"
				}`}
			>
				<svg aria-hidden="true" className="w-5 h-5" fill={item.favorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
				</svg>
			</button>
			{item.tags.length > 0 && (
				<div className="flex gap-1">
					{item.tags.slice(0, 2).map((tag) => (
						<span key={tag} className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/60">
							{tag}
						</span>
					))}
				</div>
			)}
		</div>
	);
}
