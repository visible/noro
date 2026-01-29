"use client";

type Stat = {
	label: string;
	value: number;
	color: "neutral" | "red" | "green";
	icon: string;
};

type Props = {
	checked: number;
	found: number;
	secure: number;
};

export function Stats({ checked, found, secure }: Props) {
	const stats: Stat[] = [
		{
			label: "checked",
			value: checked,
			color: "neutral",
			icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
		},
		{
			label: "exposed",
			value: found,
			color: "red",
			icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
		},
		{
			label: "secure",
			value: secure,
			color: "green",
			icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
		},
	];

	const styles = {
		neutral: {
			bg: "bg-[#161616]",
			border: "border-white/5",
			text: "text-white",
			iconbg: "from-white/10 to-white/5",
			iconcolor: "text-white/60",
		},
		red: {
			bg: "bg-red-950/20",
			border: "border-red-500/10",
			text: "text-red-400",
			iconbg: "from-red-500/20 to-red-500/5",
			iconcolor: "text-red-400",
		},
		green: {
			bg: "bg-emerald-950/20",
			border: "border-emerald-500/10",
			text: "text-emerald-400",
			iconbg: "from-emerald-500/20 to-emerald-500/5",
			iconcolor: "text-emerald-400",
		},
	};

	return (
		<div className="grid grid-cols-3 gap-4 mb-8">
			{stats.map((stat) => {
				const style = styles[stat.color];
				return (
					<div
						key={stat.label}
						className={`${style.bg} border ${style.border} rounded-2xl p-5`}
					>
						<div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.iconbg} flex items-center justify-center mb-4`}>
							<svg
								className={`w-5 h-5 ${style.iconcolor}`}
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d={stat.icon} />
							</svg>
						</div>
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
