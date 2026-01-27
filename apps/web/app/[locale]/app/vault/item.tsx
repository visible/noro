"use client";

import type { VaultItem } from "./store";
import { typeIcons } from "./icons";
import { TagList } from "@/components/tags";
import { useSidebar } from "@/components/sidebar";

interface Props {
	item: VaultItem;
	onClick: () => void;
	onFavorite: () => void;
	onTagClick?: (tag: string) => void;
}

export function VaultListItem({ item, onClick, onFavorite, onTagClick }: Props) {
	const { selectedItem, setSelectedItem } = useSidebar();
	const isSelected = selectedItem === item.id;

	function handleClick() {
		setSelectedItem(item.id);
		onClick();
	}

	return (
		<div
			onClick={handleClick}
			className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-white/10 active:bg-white/10 transition-colors cursor-pointer group min-h-[56px] ${
				isSelected ? "bg-white/10 ring-1 ring-[#FF6B00]/50" : "bg-white/5"
			}`}
		>
			<span className="text-white/60 shrink-0">{typeIcons[item.type]}</span>
			<div className="flex-1 min-w-0">
				<p className="font-medium truncate">{item.title}</p>
				<p className="text-sm text-white/40">{item.type}</p>
			</div>
			<button
				onClick={(e) => {
					e.stopPropagation();
					onFavorite();
				}}
				className={`p-2.5 rounded-lg transition-colors shrink-0 ${
					item.favorite
						? "text-[#FF6B00]"
						: "text-white/20 hover:text-white/40 sm:opacity-0 sm:group-hover:opacity-100"
				}`}
				aria-label={item.favorite ? "remove from favorites" : "add to favorites"}
			>
				<svg aria-hidden="true" className="w-5 h-5" fill={item.favorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
				</svg>
			</button>
			<div className="hidden sm:block shrink-0">
				<TagList tags={item.tags} max={2} onClick={onTagClick} />
			</div>
		</div>
	);
}
