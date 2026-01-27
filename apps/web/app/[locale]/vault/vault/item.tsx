"use client";

import type { VaultItem } from "./store";
import type { LoginData, CardData, IdentityData, ApiData, OtpData, PasskeyData } from "@/lib/types";
import { typeIcons } from "./icons";
import { TagList } from "@/components/tags";
import { useSidebar } from "@/components/sidebar";

interface Props {
	item: VaultItem;
	onClick: () => void;
	onFavorite: () => void;
	onTagClick?: (tag: string) => void;
}

function getSubtitle(item: VaultItem): string | null {
	const data = item.data;
	switch (item.type) {
		case "login":
			return (data as LoginData).username || (data as LoginData).url || null;
		case "card":
			return (data as CardData).holder || null;
		case "identity": {
			const id = data as IdentityData;
			if (id.firstname || id.lastname) {
				return [id.firstname, id.lastname].filter(Boolean).join(" ");
			}
			return id.email || null;
		}
		case "api":
			return (data as ApiData).endpoint || null;
		case "otp":
			return (data as OtpData).issuer || (data as OtpData).account || null;
		case "passkey":
			return (data as PasskeyData).rpid || null;
		default:
			return null;
	}
}

export function VaultListItem({ item, onClick, onFavorite, onTagClick }: Props) {
	const { selectedItem, setSelectedItem } = useSidebar();
	const isSelected = selectedItem === item.id;
	const subtitle = getSubtitle(item);

	function handleClick() {
		setSelectedItem(item.id);
		onClick();
	}

	return (
		<div
			onClick={handleClick}
			className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group transition-all duration-150 ${
				isSelected ? "bg-white/10 ring-1 ring-[#FF6B00]/50" : "hover:bg-white/5"
			}`}
		>
			<span className="text-white/40 shrink-0 w-5 h-5 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
				{typeIcons[item.type]}
			</span>

			<div className="flex-1 min-w-0 flex items-center gap-3">
				<div className="min-w-0 flex-1">
					<div className="flex items-baseline gap-2">
						<p className="text-white font-medium truncate text-sm">{item.title}</p>
						{subtitle && (
							<p className="text-white/50 text-xs truncate hidden sm:block">{subtitle}</p>
						)}
					</div>
				</div>

				<div className="hidden sm:block shrink-0">
					<TagList tags={item.tags} max={2} onClick={onTagClick} />
				</div>
			</div>

			<button
				onClick={(e) => {
					e.stopPropagation();
					onFavorite();
				}}
				className={`w-8 h-8 flex items-center justify-center rounded transition-all duration-150 shrink-0 ${
					item.favorite
						? "text-[#FF6B00]"
						: "text-white/20 hover:text-white/40 opacity-0 group-hover:opacity-100"
				}`}
				aria-label={item.favorite ? "remove from favorites" : "add to favorites"}
			>
				<svg
					aria-hidden="true"
					className="w-4 h-4"
					fill={item.favorite ? "currentColor" : "none"}
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={1.5}
						d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
					/>
				</svg>
			</button>
		</div>
	);
}
