"use client";

import type { VaultItem } from "./store";
import { typeIconsSmall } from "./icons";
import { useSidebar } from "@/components/sidebar";

interface Props {
	items: VaultItem[];
	onItemClick: (item: VaultItem) => void;
	onFavorite: (id: string) => void;
	onTagClick?: (tag: string) => void;
}

export function VaultTable({ items, onItemClick, onFavorite, onTagClick }: Props) {
	const { selectedItem, setSelectedItem } = useSidebar();

	return (
		<div className="w-full">
			<table className="w-full">
				<thead>
					<tr className="border-b border-white/5">
						<th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider px-4 py-2.5">name</th>
						<th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider px-4 py-2.5 hidden sm:table-cell w-24">type</th>
						<th className="text-left text-[11px] font-medium text-white/40 uppercase tracking-wider px-4 py-2.5 hidden md:table-cell">tags</th>
						<th className="w-20 px-4 py-2.5" />
					</tr>
				</thead>
				<tbody>
					{items.map((item) => {
						const isSelected = selectedItem === item.id;
						return (
							<tr
								key={item.id}
								onClick={() => { setSelectedItem(item.id); onItemClick(item); }}
								className={`group cursor-pointer border-b border-white/5 transition-colors duration-150 ${
									isSelected ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
								}`}
							>
								<td className="px-4 py-3">
									<div className="flex items-center gap-3">
										<div className="flex items-center justify-center shrink-0 text-white/30">
											{typeIconsSmall[item.type]}
										</div>
										<div className="min-w-0">
											<p className="text-[13px] font-medium text-white/90 truncate">{item.title}</p>
											<p className="text-[11px] text-white/30 sm:hidden">{item.type}</p>
										</div>
									</div>
								</td>
								<td className="px-4 py-3 hidden sm:table-cell">
									<span className="text-[12px] text-white/40 capitalize">{item.type}</span>
								</td>
								<td className="px-4 py-3 hidden md:table-cell">
									{item.tags.length > 0 ? (
										<div className="flex gap-1.5 flex-wrap">
											{item.tags.slice(0, 2).map((tag) => (
												<button
													key={tag}
													onClick={(e) => { e.stopPropagation(); onTagClick?.(tag); }}
													className="px-2 py-0.5 rounded-full text-[11px] bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors duration-150"
												>
													{tag}
												</button>
											))}
											{item.tags.length > 2 && (
												<span className="px-1.5 py-0.5 text-[11px] text-white/30">+{item.tags.length - 2}</span>
											)}
										</div>
									) : (
										<span className="text-white/20 text-[12px]">-</span>
									)}
								</td>
								<td className="px-4 py-3">
									<div className="flex items-center justify-end gap-0.5">
										<button
											onClick={(e) => { e.stopPropagation(); onFavorite(item.id); }}
											className={`p-1.5 rounded transition-all duration-150 ${
												item.favorite
													? "text-amber-400/80 hover:text-amber-400"
													: "text-white/0 group-hover:text-white/20 hover:!text-white/40"
											}`}
											aria-label={item.favorite ? "remove from favorites" : "add to favorites"}
										>
											<svg aria-hidden="true" className="w-3.5 h-3.5" fill={item.favorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
											</svg>
										</button>
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
