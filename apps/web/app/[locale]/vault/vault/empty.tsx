"use client";

interface Props {
	hasItems: boolean;
	isTrash: boolean;
	hasSearch: boolean;
	onAddItem: () => void;
}

export function VaultEmpty({ hasItems, isTrash, hasSearch, onAddItem }: Props) {
	if (isTrash) {
		return (
			<div className="flex flex-col items-center justify-center py-24">
				<div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] flex items-center justify-center mb-8 shadow-lg shadow-black/20">
					<svg aria-hidden="true" className="w-9 h-9 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
					</svg>
				</div>
				<h3 className="text-xl font-serif text-[#ededed] mb-3">Trash is empty</h3>
				<p className="text-sm text-white/40 text-center max-w-sm leading-relaxed">
					Deleted items will appear here for 30 days before being permanently removed.
				</p>
			</div>
		);
	}

	if (hasItems && hasSearch) {
		return (
			<div className="flex flex-col items-center justify-center py-24">
				<div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] flex items-center justify-center mb-8 shadow-lg shadow-black/20">
					<svg aria-hidden="true" className="w-9 h-9 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
					</svg>
				</div>
				<h3 className="text-xl font-serif text-[#ededed] mb-3">No results found</h3>
				<p className="text-sm text-white/40 text-center max-w-sm leading-relaxed">
					Try adjusting your search or filters to find what you're looking for.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center py-24">
			<div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#d4b08c]/20 to-[#d4b08c]/5 border border-[#d4b08c]/15 flex items-center justify-center mb-8 shadow-lg shadow-[#d4b08c]/10">
				<svg aria-hidden="true" className="w-11 h-11 text-[#d4b08c]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
				</svg>
			</div>
			<h3 className="text-2xl font-serif text-[#ededed] mb-3">
				Your vault is <span className="italic text-[#d4b08c]">empty</span>
			</h3>
			<p className="text-sm text-white/40 text-center max-w-md mb-10 leading-relaxed">
				Start by adding your passwords, secure notes, credit cards, and other sensitive information.
			</p>
			<button
				onClick={onAddItem}
				className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#d4b08c] text-[#0a0a0a] text-sm font-medium rounded-full hover:bg-[#d4b08c]/90 transition-all shadow-lg shadow-[#d4b08c]/20"
			>
				<svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
				</svg>
				Add your first item
			</button>
		</div>
	);
}
