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
			<div className="flex flex-col items-center justify-center py-20">
				<div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
					<svg aria-hidden="true" className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
					</svg>
				</div>
				<h3 className="text-lg font-medium text-white mb-2">Trash is empty</h3>
				<p className="text-sm text-white/40 text-center max-w-sm">
					Deleted items will appear here for 30 days before being permanently removed.
				</p>
			</div>
		);
	}

	if (hasItems && hasSearch) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
					<svg aria-hidden="true" className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
					</svg>
				</div>
				<h3 className="text-lg font-medium text-white mb-2">No results found</h3>
				<p className="text-sm text-white/40 text-center max-w-sm">
					Try adjusting your search or filters to find what you're looking for.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center py-20">
			<div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#d4b08c]/10 to-[#d4b08c]/5 border border-[#d4b08c]/10 flex items-center justify-center mb-6">
				<svg aria-hidden="true" className="w-9 h-9 text-[#d4b08c]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
				</svg>
			</div>
			<h3 className="text-xl font-semibold text-white mb-2">Your vault is empty</h3>
			<p className="text-sm text-white/40 text-center max-w-md mb-8">
				Start by adding your passwords, secure notes, credit cards, and other sensitive information.
			</p>
			<div className="flex flex-col sm:flex-row gap-3">
				<button
					onClick={onAddItem}
					className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4b08c] text-[#0a0a0a] text-sm font-medium rounded-lg hover:bg-[#d4b08c]/90 transition-all shadow-lg shadow-[#d4b08c]/10"
				>
					<svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
					</svg>
					Add your first item
				</button>
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-12 border-t border-white/[0.04]">
				<div className="flex flex-col items-center gap-2 p-4">
					<div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
						<svg aria-hidden="true" className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
						</svg>
					</div>
					<span className="text-xs text-white/50">Logins</span>
				</div>
				<div className="flex flex-col items-center gap-2 p-4">
					<div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
						<svg aria-hidden="true" className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
						</svg>
					</div>
					<span className="text-xs text-white/50">Notes</span>
				</div>
				<div className="flex flex-col items-center gap-2 p-4">
					<div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
						<svg aria-hidden="true" className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
						</svg>
					</div>
					<span className="text-xs text-white/50">Cards</span>
				</div>
				<div className="flex flex-col items-center gap-2 p-4">
					<div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
						<svg aria-hidden="true" className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
						</svg>
					</div>
					<span className="text-xs text-white/50">Identities</span>
				</div>
			</div>
		</div>
	);
}
