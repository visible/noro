"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "./config";

const menuIcon = (
	<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
	</svg>
);

const closeIcon = (
	<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
	</svg>
);

export function MobileMenu() {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (open) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	return (
		<>
			<button
				onClick={() => setOpen(true)}
				className="md:hidden p-2 -ml-2 text-black/60 hover:text-black transition-colors rounded-lg hover:bg-black/5"
				aria-label="Open menu"
			>
				{menuIcon}
			</button>

			<div
				className={`fixed inset-0 z-[100] md:hidden transition-opacity duration-300 ${
					open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
				}`}
			>
				<div
					className="absolute inset-0 bg-black/50 backdrop-blur-sm"
					onClick={() => setOpen(false)}
				/>

				<div
					className={`absolute top-0 left-0 bottom-0 w-72 bg-white shadow-2xl transition-transform duration-300 ease-out ${
						open ? "translate-x-0" : "-translate-x-full"
					}`}
				>
					<div className="flex items-center justify-between p-4 border-b border-black/5">
						<Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
							<div className="w-8 h-8 rounded-lg bg-[#C53D43] flex items-center justify-center">
								<svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
									<path d="M17.5,3.875 C19.7782,3.875 21.625,5.72183 21.625,8 C21.625,9.2471 21.0714,10.36501 20.1971,11.12122 C20.4748,11.86972 20.625,12.66939 20.625,13.5 C20.625,15.89 19.382,18.0188 17.4446,19.4143 C17.1624,19.6176 16.8653,19.8054 16.5551,19.9763 L16.5183,19.9964 C15.2037,20.7125 13.6559,21.125 12,21.125 C10.34411,21.125 8.79628,20.7124 7.48166,19.9964 C7.1745,19.8291 6.88004,19.6452 6.59991,19.4462 L6.55539,19.4143 C4.61803,18.0188 3.375,15.89 3.375,13.5 C3.375,12.66939 3.52525,11.86971 3.80294,11.12122 C2.92856,10.36501 2.375,9.2471 2.375,8 C2.375,5.72183 4.22183,3.875 6.5,3.875 C8.07432,3.875 9.44244,4.75696 10.1376,6.05321 C10.73749,5.9365 11.36069,5.875 12,5.875 C12.6393,5.875 13.2625,5.9365 13.8624,6.05321 C14.5576,4.75696 15.9257,3.875 17.5,3.875 Z" />
								</svg>
							</div>
							<span className="font-semibold text-black">noro</span>
						</Link>
						<button
							onClick={() => setOpen(false)}
							className="p-2 text-black/60 hover:text-black transition-colors rounded-lg hover:bg-black/5"
							aria-label="Close menu"
						>
							{closeIcon}
						</button>
					</div>

					<nav className="p-4 overflow-y-auto h-[calc(100%-65px)]">
						<div className="space-y-6">
							{navigation.map((group) => (
								<div key={group.title}>
									<h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#C53D43]/70 mb-2 px-3">
										{group.title}
									</h4>
									<ul className="space-y-0.5">
										{group.items.map((item) => {
											const isactive = pathname === item.href;
											return (
												<li key={item.href}>
													<Link
														href={item.href}
														onClick={() => setOpen(false)}
														className={`block px-3 py-2.5 text-sm rounded-xl transition-all ${
															isactive
																? "bg-[#C53D43] text-white font-medium"
																: "text-black/60 hover:text-black hover:bg-black/5"
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
				</div>
			</div>
		</>
	);
}
