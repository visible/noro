"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";

const sections = [
	{
		label: "vault",
		items: [
			{ href: "/vault", label: "secrets", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
			{ href: "/vault/generator", label: "generator", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
		],
	},
	{
		label: "security",
		items: [
			{ href: "/vault/health", label: "health", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
			{ href: "/vault/activity", label: "activity", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
		],
	},
	{
		label: "account",
		items: [
			{ href: "/vault/settings", label: "settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
		],
	},
];

export function SidebarNav() {
	const pathname = usePathname();

	return (
		<div className="space-y-6">
			{sections.map((section) => (
				<div key={section.label}>
					<p className="px-2 mb-1.5 text-[11px] font-medium text-white/40 uppercase tracking-wider">
						{section.label}
					</p>
					<nav className="space-y-0.5">
						{section.items.map((item) => {
							const isActive = pathname.endsWith(item.href) || pathname.endsWith(item.href + "/");
							return (
								<Link
									key={item.href}
									href={item.href}
									className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors duration-150 ${
										isActive
											? "bg-[#FF6B00]/10 text-[#FF6B00]"
											: "text-white/60 hover:bg-white/5 hover:text-white/80"
									}`}
								>
									<svg
										className={`w-4 h-4 ${isActive ? "text-[#FF6B00]" : "text-white/40"}`}
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
										aria-hidden="true"
									>
										<path d={item.icon} />
									</svg>
									<span className="text-[13px] font-medium">{item.label}</span>
								</Link>
							);
						})}
					</nav>
				</div>
			))}
		</div>
	);
}
