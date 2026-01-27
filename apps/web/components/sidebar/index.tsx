"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { useSidebar } from "./context";

export { SidebarProvider, useSidebar } from "./context";
export { MobileHeader } from "./header";

interface User {
	id: string;
	email: string;
	name: string;
	image?: string | null;
}

interface Props {
	user: User;
}

const mainNav = [
	{ href: "/vault", icon: "vault", label: "Vault" },
	{ href: "/vault/generator", icon: "generator", label: "Generator" },
];

const secondaryNav = [
	{ href: "/vault/health", icon: "health", label: "Health" },
	{ href: "/vault/breaches", icon: "breaches", label: "Breaches" },
	{ href: "/vault/activity", icon: "activity", label: "Activity" },
	{ href: "/vault/audit", icon: "audit", label: "Audit" },
];

const toolsNav = [
	{ href: "/vault/import", icon: "import", label: "Import" },
	{ href: "/vault/export", icon: "export", label: "Export" },
	{ href: "/vault/settings", icon: "settings", label: "Settings" },
];

const icons: Record<string, React.ReactNode> = {
	vault: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
		</svg>
	),
	generator: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
		</svg>
	),
	activity: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	),
	health: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
		</svg>
	),
	settings: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		</svg>
	),
	docs: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
		</svg>
	),
	breaches: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
		</svg>
	),
	audit: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
		</svg>
	),
	import: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
		</svg>
	),
	export: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
		</svg>
	),
};

function initial(name: string): string {
	return name.charAt(0).toUpperCase();
}

function NavItem({ href, icon, label, isActive, collapsed, onClick }: {
	href: string;
	icon: string;
	label: string;
	isActive: boolean;
	collapsed: boolean;
	onClick?: () => void;
}) {
	return (
		<Link
			href={href}
			onClick={onClick}
			className={`flex items-center gap-3 rounded-lg transition-colors ${
				collapsed ? "w-9 h-9 justify-center" : "px-3 py-2"
			} ${
				isActive
					? "bg-[#FF6B00]/15 text-[#FF6B00]"
					: "text-white/50 hover:text-white hover:bg-white/5"
			}`}
			title={collapsed ? label : undefined}
		>
			{icons[icon]}
			{!collapsed && <span className="text-sm font-medium">{label}</span>}
		</Link>
	);
}

export function Sidebar({ user }: Props) {
	const { open, setOpen, collapsed, toggleCollapsed } = useSidebar();
	const pathname = usePathname();

	function isActive(href: string) {
		if (href === "/vault") {
			return pathname.endsWith("/vault") || pathname.endsWith("/vault/");
		}
		return pathname.includes(href);
	}

	return (
		<>
			<div
				className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-200 ${
					open ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
				onClick={() => setOpen(false)}
			/>
			<aside
				className={`fixed md:relative top-0 left-0 h-full bg-[#0a0a0a] border-r border-white/5 flex flex-col z-50 transition-all duration-200 md:translate-x-0 ${
					open ? "translate-x-0" : "-translate-x-full"
				} ${collapsed ? "w-14" : "w-56"}`}
			>
				<div className={`p-2.5 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
					{collapsed ? (
						<>
							<button
								onClick={toggleCollapsed}
								className="hidden md:flex w-9 h-9 items-center justify-center hover:bg-white/5 rounded-lg transition-colors text-[#FF6B00]"
								title="Expand sidebar"
							>
								<Logo />
							</button>
							<Link href="/" className="flex md:hidden w-9 h-9 items-center justify-center hover:bg-white/5 rounded-lg transition-colors text-[#FF6B00]">
								<Logo />
							</Link>
						</>
					) : (
						<>
							<Link href="/" className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors flex-1">
								<span className="text-[#FF6B00]">
									<Logo />
								</span>
								<span className="font-semibold text-white">noro</span>
							</Link>
							<button
								onClick={toggleCollapsed}
								className="hidden md:flex w-8 h-8 items-center justify-center hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white/60"
								title="Collapse sidebar"
							>
								<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
								</svg>
							</button>
						</>
					)}
				</div>

				<nav className={`flex-1 flex flex-col p-2.5 overflow-y-auto scrollbar-hidden ${collapsed ? "items-center" : ""}`}>
					<div className={`flex flex-col gap-1 ${collapsed ? "items-center" : ""}`}>
						{mainNav.map((item) => (
							<NavItem
								key={item.href}
								{...item}
								isActive={isActive(item.href)}
								collapsed={collapsed}
								onClick={() => setOpen(false)}
							/>
						))}
					</div>

					<div className={`my-3 ${collapsed ? "w-6" : "w-full"} h-px bg-white/10`} />

					<div className={`flex flex-col gap-1 ${collapsed ? "items-center" : ""}`}>
						{secondaryNav.map((item) => (
							<NavItem
								key={item.href}
								{...item}
								isActive={isActive(item.href)}
								collapsed={collapsed}
								onClick={() => setOpen(false)}
							/>
						))}
					</div>

					<div className={`my-3 ${collapsed ? "w-6" : "w-full"} h-px bg-white/10`} />

					<div className={`flex flex-col gap-1 ${collapsed ? "items-center" : ""}`}>
						{toolsNav.map((item) => (
							<NavItem
								key={item.href}
								{...item}
								isActive={isActive(item.href)}
								collapsed={collapsed}
								onClick={() => setOpen(false)}
							/>
						))}
					</div>
				</nav>

				<div className={`p-2.5 flex flex-col gap-1 border-t border-white/5 ${collapsed ? "items-center" : ""}`}>
					<a
						href="https://github.com/visible/noro"
						target="_blank"
						rel="noopener noreferrer"
						className={`flex items-center gap-3 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors ${
							collapsed ? "w-9 h-9 justify-center" : "px-3 py-2"
						}`}
						title="Documentation"
					>
						{icons.docs}
						{!collapsed && <span className="text-sm">Docs</span>}
					</a>
					<Link
						href="/vault/settings"
						className={`flex items-center gap-3 rounded-lg hover:bg-white/5 transition-colors ${
							collapsed ? "w-9 h-9 justify-center" : "px-3 py-2"
						}`}
						title={collapsed ? user.name : undefined}
					>
						<div className="w-7 h-7 rounded-full bg-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] text-sm font-medium shrink-0">
							{initial(user.name)}
						</div>
						{!collapsed && (
							<div className="flex flex-col min-w-0">
								<span className="text-sm font-medium text-white truncate">{user.name}</span>
								<span className="text-xs text-white/40 truncate">{user.email}</span>
							</div>
						)}
					</Link>
				</div>
			</aside>
		</>
	);
}
