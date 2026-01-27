"use client";

type Props = {
	value: number;
	total: number;
};

function color(score: number): string {
	if (score >= 80) return "#22c55e";
	if (score >= 60) return "#eab308";
	if (score >= 40) return "#f97316";
	return "#ef4444";
}

function label(score: number): string {
	if (score >= 80) return "excellent";
	if (score >= 60) return "good";
	if (score >= 40) return "fair";
	return "poor";
}

export function Score({ value, total }: Props) {
	const c = color(value);
	const radius = 80;
	const stroke = 12;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (value / 100) * circumference;

	return (
		<div className="bg-white/5 rounded-xl p-8 mb-6">
			<div className="flex items-center gap-8">
				<div className="relative w-48 h-48">
					<svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200" aria-hidden="true">
						<circle
							cx="100"
							cy="100"
							r={radius}
							fill="none"
							stroke="white"
							strokeOpacity="0.1"
							strokeWidth={stroke}
						/>
						<circle
							cx="100"
							cy="100"
							r={radius}
							fill="none"
							stroke={c}
							strokeWidth={stroke}
							strokeLinecap="round"
							strokeDasharray={circumference}
							strokeDashoffset={offset}
							className="transition-all duration-700"
						/>
					</svg>
					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<span className="text-5xl font-bold" style={{ color: c }}>{value}</span>
						<span className="text-sm text-white/40">{label(value)}</span>
					</div>
				</div>

				<div className="flex-1">
					<h2 className="text-xl font-semibold mb-2">security score</h2>
					<p className="text-white/60 mb-4">
						based on {total} password{total !== 1 ? "s" : ""} in your vault
					</p>
					{value < 80 && (
						<p className="text-sm text-white/40">
							improve your score by fixing the issues below
						</p>
					)}
					{value >= 80 && total > 0 && (
						<p className="text-sm text-white/40">
							your passwords are in great shape
						</p>
					)}
					{total === 0 && (
						<p className="text-sm text-white/40">
							add passwords to your vault to see your score
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
