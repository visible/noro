"use client";

interface Props {
	title: string;
	subtitle: string;
}

const stats = [
	{ value: "256-bit", label: "Encryption" },
	{ value: "Zero", label: "Knowledge" },
	{ value: "100%", label: "Private" },
];

export function AuthPanel({ title, subtitle }: Props) {
	return (
		<div className="hidden lg:flex w-[60%] min-h-dvh bg-[#0d0c0a] relative overflow-hidden items-center justify-center">
			<div className="absolute inset-0 bg-linear-to-bl from-[#d4b08c]/2 via-transparent to-transparent" />
			<div className="absolute inset-0 opacity-[0.03]" style={{
				backgroundImage: `
					linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
					linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
				`,
				backgroundSize: '60px 60px'
			}} />
			<div className="relative z-10 max-w-md px-12">
				<div className="relative mb-16">
					<div className="flex justify-center gap-8 mb-8">
						{[0, 1, 2].map((i) => (
							<div key={i} className="relative">
								<div
									className="w-3 h-3 rounded-full bg-[#d4b08c]/20 animate-pulse"
									style={{ animationDelay: `${i * 0.3}s` }}
								/>
								<div
									className="absolute inset-0 w-3 h-3 rounded-full bg-[#d4b08c]/40 animate-ping"
									style={{ animationDelay: `${i * 0.3}s`, animationDuration: '2s' }}
								/>
							</div>
						))}
					</div>
					<div className="flex justify-center">
						<svg width="200" height="60" className="text-white/10" aria-hidden="true">
							<path d="M20 0 L20 30 L100 30 L100 60" fill="none" stroke="currentColor" strokeWidth="1" />
							<path d="M100 0 L100 60" fill="none" stroke="currentColor" strokeWidth="1" />
							<path d="M180 0 L180 30 L100 30" fill="none" stroke="currentColor" strokeWidth="1" />
						</svg>
					</div>
					<div className="flex justify-center -mt-1">
						<div className="w-4 h-4 rounded-full bg-[#d4b08c] shadow-[0_0_20px_rgba(212,176,140,0.4)]" />
					</div>
				</div>
				<div className="text-center">
					<h2 className="font-serif text-2xl text-[#ededed]/90 mb-4">
						{title}
					</h2>
					<p className="text-white/40 text-sm leading-relaxed mb-10">
						{subtitle}
					</p>
					<div className="flex justify-center gap-12">
						{stats.map((stat) => (
							<div key={stat.label} className="text-center">
								<p className="text-lg font-medium text-[#d4b08c]">{stat.value}</p>
								<p className="text-[10px] uppercase tracking-wider text-white/30 mt-1">{stat.label}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
