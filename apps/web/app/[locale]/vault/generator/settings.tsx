import type { Mode } from "./strength";
import { Icons } from "./icons";

interface Props {
	mode: Mode;
	length: number;
	uppercase: boolean;
	lowercase: boolean;
	numbers: boolean;
	symbols: boolean;
	onModeChange: (mode: Mode) => void;
	onLengthChange: (length: number) => void;
	onUppercaseChange: (value: boolean) => void;
	onLowercaseChange: (value: boolean) => void;
	onNumbersChange: (value: boolean) => void;
	onSymbolsChange: (value: boolean) => void;
}

export function Settings({
	mode, length, uppercase, lowercase, numbers, symbols,
	onModeChange, onLengthChange, onUppercaseChange, onLowercaseChange, onNumbersChange, onSymbolsChange,
}: Props) {
	const minLength = mode === "diceware" ? 3 : mode === "pin" ? 4 : 8;
	const maxLength = mode === "diceware" ? 10 : mode === "pin" ? 12 : 64;
	const percent = ((length - minLength) / (maxLength - minLength)) * 100;

	const options = [
		{ key: "uppercase", label: "A-Z", desc: "uppercase", value: uppercase, set: onUppercaseChange },
		{ key: "lowercase", label: "a-z", desc: "lowercase", value: lowercase, set: onLowercaseChange },
		{ key: "numbers", label: "0-9", desc: "numbers", value: numbers, set: onNumbersChange },
		{ key: "symbols", label: "!@#", desc: "symbols", value: symbols, set: onSymbolsChange },
	];

	return (
		<div className="bg-[#161616]/80 backdrop-blur-sm border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
			<div className="space-y-6">
				<div>
					<label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Type</label>
					<div className="flex gap-2">
						{(["random", "diceware", "pin"] as Mode[]).map((m) => (
							<button
								key={m}
								onClick={() => onModeChange(m)}
								className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
									mode === m
										? "bg-[#d4b08c] text-[#0a0a0a]"
										: "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
								}`}
							>
								{m}
							</button>
						))}
					</div>
				</div>

				<div>
					<div className="flex items-center justify-between mb-3">
						<label className="text-xs font-medium text-white/40 uppercase tracking-wider">
							Length{mode === "diceware" && " (words)"}
						</label>
						<span className="text-sm font-mono text-[#ededed] bg-white/5 px-2.5 py-1 rounded-md">
							{length}
						</span>
					</div>
					<div className="relative">
						<div className="h-1.5 bg-white/5 rounded-full">
							<div
								className="h-full bg-gradient-to-r from-[#d4b08c] to-[#d4b08c]/70 rounded-full transition-all"
								style={{ width: `${percent}%` }}
							/>
						</div>
						<input
							type="range"
							min={minLength}
							max={maxLength}
							value={length}
							onChange={(e) => onLengthChange(Number(e.target.value))}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>
						<div
							className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#ededed] rounded-full shadow-lg shadow-black/20 pointer-events-none transition-all"
							style={{ left: `calc(${percent}% - 8px)` }}
						/>
					</div>
					<div className="flex justify-between mt-2">
						<span className="text-xs text-white/30">{minLength}</span>
						<span className="text-xs text-white/30">{maxLength}</span>
					</div>
				</div>

				{mode === "random" && (
					<div>
						<label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Include</label>
						<div className="grid grid-cols-2 gap-2">
							{options.map((opt) => (
								<button
									key={opt.key}
									onClick={() => opt.set(!opt.value)}
									className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
										opt.value
											? "bg-white/5 border border-white/10"
											: "bg-white/[0.02] border border-transparent hover:bg-white/5"
									}`}
								>
									<div
										className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
											opt.value ? "bg-[#d4b08c]" : "bg-white/10"
										}`}
									>
										{opt.value && Icons.checkSmall}
									</div>
									<div className="text-left">
										<span className="block text-sm font-mono text-[#ededed]">{opt.label}</span>
										<span className="block text-xs text-white/40">{opt.desc}</span>
									</div>
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
