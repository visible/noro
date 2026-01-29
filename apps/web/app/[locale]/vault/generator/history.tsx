import { Icons } from "./icons";

interface Props {
	history: string[];
	onCopy: (text: string) => void;
}

export function History({ history, onCopy }: Props) {
	if (history.length === 0) return null;

	return (
		<div className="pt-2">
			<h2 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Recent</h2>
			<div className="space-y-1.5">
				{history.map((pw, i) => (
					<div
						key={i}
						className="flex items-center gap-3 px-4 py-2.5 bg-[#161616]/50 border border-white/5 rounded-lg group hover:bg-[#161616]/80 hover:border-white/10 transition-colors"
					>
						<p className="flex-1 font-mono text-sm text-white/40 truncate">{pw}</p>
						<button
							onClick={() => onCopy(pw)}
							className="p-1.5 rounded-md text-white/30 hover:text-white/80 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
						>
							{Icons.copy}
						</button>
					</div>
				))}
			</div>
		</div>
	);
}
