"use client";

type Props = {
	value: number;
	total: number;
};

function color(score: number): string {
	if (score >= 80) return "#d4b08c";
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
	const size = 200;

	return (
		<div className="flex flex-col items-center mb-10">
			<div className="relative" style={{ width: size, height: size }}>
				<div
					className="absolute inset-0 rounded-full blur-2xl opacity-20"
					style={{ backgroundColor: c }}
				/>
				<svg
					className="-rotate-90"
					width={size}
					height={size}
					viewBox={`0 0 ${size} ${size}`}
					aria-hidden="true"
				>
					<defs>
						<linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor={c} stopOpacity="0.3" />
							<stop offset="100%" stopColor={c} />
						</linearGradient>
					</defs>
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill="none"
						stroke="rgba(255,255,255,0.05)"
						strokeWidth={stroke}
					/>
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill="none"
						stroke="url(#scoreGradient)"
						strokeWidth={stroke}
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={offset}
						className="transition-all duration-700"
					/>
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<span className="text-5xl font-bold text-white">{value}</span>
					<span
						className="text-sm font-medium mt-1"
						style={{ color: c }}
					>
						{label(value)}
					</span>
				</div>
			</div>
			<p className="text-white/40 text-sm mt-4">
				{total > 0
					? `based on ${total} password${total !== 1 ? "s" : ""}`
					: "add passwords to calculate score"}
			</p>
		</div>
	);
}
