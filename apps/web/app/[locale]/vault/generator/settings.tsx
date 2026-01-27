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
		<div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
			<div className="space-y-6">
				<div>
					<label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Type</label>
					<div className="flex gap-2">
						{(["random", "diceware", "pin"] as Mode[]).map((m) => (
							<button
								key={m}
								onClick={() => onModeChange(m)}
								className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
									mode === m
										? "bg-orange-500 text-white"
										: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
								}`}
							>
								{m}
							</button>
						))}
					</div>
				</div>

				<div>
					<div className="flex items-center justify-between mb-3">
						<label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
							Length{mode === "diceware" && " (words)"}
						</label>
						<span className="text-sm font-mono text-zinc-300 bg-zinc-800 px-2.5 py-1 rounded-md">
							{length}
						</span>
					</div>
					<div className="relative">
						<div className="h-1.5 bg-zinc-800 rounded-full">
							<div
								className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all"
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
							className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-black/20 pointer-events-none transition-all"
							style={{ left: `calc(${percent}% - 8px)` }}
						/>
					</div>
					<div className="flex justify-between mt-2">
						<span className="text-xs text-zinc-600">{minLength}</span>
						<span className="text-xs text-zinc-600">{maxLength}</span>
					</div>
				</div>

				{mode === "random" && (
					<div>
						<label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Include</label>
						<div className="grid grid-cols-2 gap-2">
							{options.map((opt) => (
								<button
									key={opt.key}
									onClick={() => opt.set(!opt.value)}
									className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
										opt.value
											? "bg-zinc-800 border border-zinc-700"
											: "bg-zinc-800/50 border border-transparent hover:bg-zinc-800"
									}`}
								>
									<div
										className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
											opt.value ? "bg-orange-500" : "bg-zinc-700"
										}`}
									>
										{opt.value && Icons.checkSmall}
									</div>
									<div className="text-left">
										<span className="block text-sm font-mono text-zinc-300">{opt.label}</span>
										<span className="block text-xs text-zinc-500">{opt.desc}</span>
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
