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
					<tr className="border-b border-white/[0.04]">
						<th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3">name</th>
						<th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell w-24">type</th>
						<th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">tags</th>
						<th className="w-16 px-4 py-3" />
					</tr>
				</thead>
				<tbody>
					{items.map((item) => {
						const isSelected = selectedItem === item.id;
						return (
							<tr
								key={item.id}
								onClick={() => { setSelectedItem(item.id); onItemClick(item); }}
								className={`group cursor-pointer border-b border-white/[0.04] transition-colors ${
									isSelected ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
								}`}
							>
								<td className="px-4 py-3.5">
									<div className="flex items-center gap-3">
										<div className="flex items-center justify-center shrink-0 text-zinc-500">
											{typeIconsSmall[item.type]}
										</div>
										<div className="min-w-0">
											<p className="text-sm font-medium text-white truncate">{item.title}</p>
											<p className="text-xs text-zinc-500 sm:hidden">{item.type}</p>
										</div>
									</div>
								</td>
								<td className="px-4 py-3.5 hidden sm:table-cell">
									<span className="text-xs text-zinc-500 capitalize">{item.type}</span>
								</td>
								<td className="px-4 py-3.5 hidden md:table-cell">
									{item.tags.length > 0 ? (
										<div className="flex gap-1.5 flex-wrap">
											{item.tags.slice(0, 2).map((tag) => (
												<button
													key={tag}
													onClick={(e) => { e.stopPropagation(); onTagClick?.(tag); }}
													className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300 transition-colors"
												>
													{tag}
												</button>
											))}
											{item.tags.length > 2 && (
												<span className="px-1.5 py-0.5 text-xs text-zinc-600">+{item.tags.length - 2}</span>
											)}
										</div>
									) : (
										<span className="text-zinc-700 text-xs">-</span>
									)}
								</td>
								<td className="px-4 py-3.5">
									<div className="flex items-center justify-end">
										<button
											onClick={(e) => { e.stopPropagation(); onFavorite(item.id); }}
											className={`p-1.5 rounded transition-all ${
												item.favorite
													? "text-amber-400 hover:text-amber-300"
													: "text-transparent group-hover:text-zinc-600 hover:!text-zinc-400"
											}`}
											aria-label={item.favorite ? "remove from favorites" : "add to favorites"}
										>
											<svg aria-hidden="true" className="w-4 h-4" fill={item.favorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
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
