import { Icons } from "./icons";

interface Props {
	password: string;
	copied: boolean;
	strengthInfo: { label: string; percent: number };
	onCopy: () => void;
	onRegenerate: () => void;
}

export function Output({ password, copied, strengthInfo, onCopy, onRegenerate }: Props) {
	const gradientColor = strengthInfo.label === "strong"
		? "from-emerald-500 to-emerald-400"
		: strengthInfo.label === "good"
			? "from-amber-500 to-amber-400"
			: "from-red-500 to-red-400";

	const textColor = strengthInfo.label === "strong"
		? "text-emerald-400"
		: strengthInfo.label === "good"
			? "text-amber-400"
			: "text-red-400";

	return (
		<div className="bg-[#161616]/80 backdrop-blur-sm border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
			<div className="flex items-center gap-3">
				<p className="flex-1 font-mono text-base break-all text-[#ededed] min-h-[48px] flex items-center leading-relaxed">
					{password || <span className="text-white/30">click generate to create a password</span>}
				</p>
				{password && (
					<div className="flex gap-1.5 shrink-0">
						<button
							onClick={onCopy}
							className={`p-2 rounded-lg transition-all ${
								copied
									? "bg-emerald-500/10 text-emerald-400"
									: "text-white/40 hover:text-white/80 hover:bg-white/5"
							}`}
						>
							{copied ? Icons.check : Icons.copy}
						</button>
						<button
							onClick={onRegenerate}
							className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-all"
						>
							{Icons.refresh}
						</button>
					</div>
				)}
			</div>

			{password && (
				<div className="mt-4 pt-4 border-t border-white/5">
					<div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
						<div
							className={`h-full bg-gradient-to-r ${gradientColor} rounded-full transition-all duration-500 ease-out`}
							style={{ width: `${strengthInfo.percent}%` }}
						/>
					</div>
					<p className="mt-2.5 text-xs text-white/40">
						strength: <span className={textColor}>{strengthInfo.label}</span>
					</p>
				</div>
			)}
		</div>
	);
}
