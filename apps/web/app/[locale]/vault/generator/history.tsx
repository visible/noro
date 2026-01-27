import { Icons } from "./icons";

interface Props {
	history: string[];
	onCopy: (text: string) => void;
}

export function History({ history, onCopy }: Props) {
	if (history.length === 0) return null;

	return (
		<div className="pt-2">
			<h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Recent</h2>
			<div className="space-y-1.5">
				{history.map((pw, i) => (
					<div
						key={i}
						className="flex items-center gap-3 px-4 py-2.5 bg-zinc-900/30 border border-zinc-800/50 rounded-lg group hover:bg-zinc-900/50 transition-colors"
					>
						<p className="flex-1 font-mono text-sm text-zinc-500 truncate">{pw}</p>
						<button
							onClick={() => onCopy(pw)}
							className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all"
						>
							{Icons.copy}
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
