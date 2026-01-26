"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "./config";

export function Sidebar() {
	const pathname = usePathname();
	const activeRef = useRef<HTMLAnchorElement>(null);

	useEffect(() => {
		activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
	}, [pathname]);

	return (
		<aside className="hidden md:block w-56 shrink-0 border-r border-black/5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
			<nav className="p-6">
				<div className="space-y-8">
					{navigation.map((group) => (
						<div key={group.title}>
							<h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#C53D43] mb-3 flex items-center gap-2">
								<span className="w-4 h-px bg-[#C53D43]/40" />
								{group.title}
							</h4>
							<ul className="space-y-1">
								{group.items.map((item) => {
									const isactive = pathname === item.href;
									return (
										<li key={item.href}>
											<Link
												ref={isactive ? activeRef : null}
												href={item.href}
												className={`block px-3 py-2 text-sm rounded-lg transition-all outline-none ${
													isactive
														? "bg-[#C53D43] text-white font-medium"
														: "text-black/50 hover:text-black hover:bg-black/5"
												}`}
											>
												{item.title}
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
					))}
				</div>
			</nav>
		</aside>
	);
}
