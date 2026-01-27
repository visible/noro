"use client";

type Stat = {
	label: string;
	value: number;
	color: "neutral" | "red" | "green";
};

type Props = {
	checked: number;
	found: number;
	secure: number;
};

export function Stats({ checked, found, secure }: Props) {
	const stats: Stat[] = [
		{ label: "checked", value: checked, color: "neutral" },
		{ label: "found in breaches", value: found, color: "red" },
		{ label: "secure", value: secure, color: "green" },
	];

	const styles = {
		neutral: {
			bg: "bg-zinc-900",
			border: "border-white/[0.08]",
			text: "text-white",
		},
		red: {
			bg: "bg-red-950/30",
			border: "border-red-500/20",
			text: "text-red-400",
		},
		green: {
			bg: "bg-emerald-950/30",
			border: "border-emerald-500/20",
			text: "text-emerald-400",
		},
	};

	return (
		<div className="grid grid-cols-3 gap-4 mb-8">
			{stats.map((stat) => {
				const style = styles[stat.color];
				return (
					<div
						key={stat.label}
						className={`${style.bg} border ${style.border} rounded-xl p-5`}
					>
						<p className={`text-3xl font-semibold ${style.text}`}>
							{stat.value}
						</p>
						<p className="text-sm text-white/40 mt-1">{stat.label}</p>
					</div>
				);
			})}
		</div>
	);
}
