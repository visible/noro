"use client";

import { useRouter, usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";

interface User {
	id: string;
	email: string;
	name: string | null;
}

const navItems = [
	{ href: "/app", label: "vault", icon: "🔐" },
	{ href: "/app/generator", label: "generator", icon: "🎲" },
	{ href: "/app/settings", label: "settings", icon: "⚙️" },
];

export function Sidebar({ user }: { user: User }) {
	const router = useRouter();
	const pathname = usePathname();

	async function handleLogout() {
		await fetch("/api/auth/logout", { method: "POST" });
		router.push("/");
	}

	return (
		<aside className="w-64 border-r border-white/10 p-6 flex flex-col">
			<Link href="/" className="mb-8">
				<Logo />
			</Link>

			<nav className="flex-1 space-y-1">
				{navItems.map((item) => {
					const isActive = pathname.endsWith(item.href) || pathname.endsWith(item.href + "/");
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
								isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
							}`}
						>
							<span aria-hidden="true">{item.icon}</span>
							{item.label}
						</Link>
					);
				})}
			</nav>

			<div className="pt-6 border-t border-white/10">
				<div className="px-4 mb-4">
					<p className="text-sm font-medium truncate">{user.name || user.email}</p>
					<p className="text-xs text-white/40 truncate">{user.email}</p>
				</div>
				<button
					onClick={handleLogout}
					className="w-full px-4 py-2 text-left text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
				>
					sign out
				</button>
			</div>
		</aside>
	);
}
