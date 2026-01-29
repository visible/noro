"use client";

import { useState } from "react";
import { Page, Header, Empty } from "@/components/dashboard";

type AuditStatus = "success" | "failed" | "warning";
type AuditAction = "login" | "logout" | "item_accessed" | "item_created" | "item_updated" | "item_deleted" | "settings_changed" | "export" | "api_access" | "failed_login";

interface AuditEntry {
	id: string;
	timestamp: string;
	action: AuditAction;
	ip: string;
	device: string;
	browser: string;
	status: AuditStatus;
	details: string;
	location?: string;
}

const labels: Record<AuditAction, string> = {
	login: "sign in",
	logout: "sign out",
	item_accessed: "item accessed",
	item_created: "item created",
	item_updated: "item updated",
	item_deleted: "item deleted",
	settings_changed: "settings changed",
	export: "data export",
	api_access: "api access",
	failed_login: "failed login",
};

const mockdata: AuditEntry[] = [
	{ id: "1", timestamp: "2026-01-27T14:32:00Z", action: "login", ip: "192.168.1.105", device: "MacBook Pro", browser: "Chrome 121", status: "success", details: "Successful authentication via password", location: "San Francisco, US" },
	{ id: "2", timestamp: "2026-01-27T14:30:00Z", action: "failed_login", ip: "45.33.32.156", device: "Unknown", browser: "Unknown", status: "failed", details: "Invalid password attempt", location: "Moscow, RU" },
	{ id: "3", timestamp: "2026-01-27T13:15:00Z", action: "item_accessed", ip: "192.168.1.105", device: "MacBook Pro", browser: "Chrome 121", status: "success", details: "Viewed login credentials for GitHub", location: "San Francisco, US" },
	{ id: "4", timestamp: "2026-01-27T12:45:00Z", action: "settings_changed", ip: "192.168.1.105", device: "MacBook Pro", browser: "Chrome 121", status: "success", details: "Two-factor authentication enabled", location: "San Francisco, US" },
	{ id: "5", timestamp: "2026-01-27T11:20:00Z", action: "item_created", ip: "192.168.1.105", device: "MacBook Pro", browser: "Chrome 121", status: "success", details: "Created new login entry for AWS Console", location: "San Francisco, US" },
	{ id: "6", timestamp: "2026-01-26T22:10:00Z", action: "api_access", ip: "10.0.0.42", device: "Server", browser: "CLI/1.0", status: "success", details: "API key used to fetch vault items", location: "AWS us-east-1" },
	{ id: "7", timestamp: "2026-01-26T18:30:00Z", action: "export", ip: "192.168.1.105", device: "MacBook Pro", browser: "Chrome 121", status: "warning", details: "Exported 45 vault items to JSON", location: "San Francisco, US" },
	{ id: "8", timestamp: "2026-01-26T16:45:00Z", action: "item_updated", ip: "192.168.1.105", device: "iPhone 15 Pro", browser: "Safari Mobile", status: "success", details: "Updated password for Slack workspace", location: "San Francisco, US" },
	{ id: "9", timestamp: "2026-01-26T14:20:00Z", action: "logout", ip: "192.168.1.105", device: "MacBook Pro", browser: "Chrome 121", status: "success", details: "Manual logout", location: "San Francisco, US" },
	{ id: "10", timestamp: "2026-01-26T10:00:00Z", action: "login", ip: "192.168.1.105", device: "MacBook Pro", browser: "Chrome 121", status: "success", details: "Successful authentication via biometric", location: "San Francisco, US" },
	{ id: "11", timestamp: "2026-01-25T23:45:00Z", action: "failed_login", ip: "185.220.101.42", device: "Unknown", browser: "Unknown", status: "failed", details: "Account locked after 5 failed attempts", location: "Berlin, DE" },
	{ id: "12", timestamp: "2026-01-25T19:30:00Z", action: "item_deleted", ip: "192.168.1.105", device: "MacBook Pro", browser: "Chrome 121", status: "success", details: "Moved item to trash: Old Netflix login", location: "San Francisco, US" },
];

const actions: { value: AuditAction | "all"; label: string }[] = [
	{ value: "all", label: "all actions" },
	{ value: "login", label: "sign in" },
	{ value: "logout", label: "sign out" },
	{ value: "failed_login", label: "failed login" },
	{ value: "item_accessed", label: "item accessed" },
	{ value: "item_created", label: "item created" },
	{ value: "item_updated", label: "item updated" },
	{ value: "item_deleted", label: "item deleted" },
	{ value: "settings_changed", label: "settings" },
	{ value: "export", label: "export" },
	{ value: "api_access", label: "api access" },
];

const statuses: { value: AuditStatus | "all"; label: string }[] = [
	{ value: "all", label: "all status" },
	{ value: "success", label: "success" },
	{ value: "failed", label: "failed" },
	{ value: "warning", label: "warning" },
];

const PER_PAGE = 10;

function relative(date: string): string {
	const now = new Date();
	const then = new Date(date);
	const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
	if (diff < 60) return "just now";
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
	return then.toLocaleDateString();
}

function StatusDot({ status }: { status: AuditStatus }) {
	const colors: Record<AuditStatus, string> = {
		success: "bg-emerald-500 shadow-emerald-500/50",
		failed: "bg-red-500 shadow-red-500/50",
		warning: "bg-amber-500 shadow-amber-500/50",
	};
	return <div className={`w-2.5 h-2.5 rounded-full ${colors[status]} shadow-[0_0_8px]`} />;
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
	return (
		<select
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="px-4 py-2.5 bg-[#161616] border border-white/10 rounded-lg text-white/70 text-sm focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 appearance-none cursor-pointer min-w-[140px]"
			style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff40'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px", paddingRight: "40px" }}
		>
			{options.map((opt) => (
				<option key={opt.value} value={opt.value} className="bg-[#161616]">
					{opt.label}
				</option>
			))}
		</select>
	);
}

function Entry({ entry, expanded, onToggle }: { entry: AuditEntry; expanded: boolean; onToggle: () => void }) {
	return (
		<div className="relative pl-8">
			<div className="absolute left-0 top-3">
				<StatusDot status={entry.status} />
			</div>
			<div
				className={`bg-[#161616] rounded-xl border transition-all duration-200 cursor-pointer ${expanded ? "border-white/10" : "border-white/5 hover:border-white/10"}`}
				onClick={onToggle}
			>
				<div className="p-4">
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-3 mb-1">
								<span className="font-medium text-white">{labels[entry.action]}</span>
								<span className={`text-xs px-2 py-0.5 rounded-full ${entry.status === "success" ? "bg-emerald-500/20 text-emerald-400" : entry.status === "failed" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>
									{entry.status}
								</span>
							</div>
							<p className="text-sm text-white/50">{entry.details}</p>
						</div>
						<div className="text-right shrink-0">
							<p className="text-sm text-white/40">{relative(entry.timestamp)}</p>
							<p className="text-xs text-white/30 mt-0.5">{new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
						</div>
					</div>
				</div>
				{expanded && (
					<div className="px-4 pb-4 pt-2 border-t border-white/5">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div>
								<p className="text-xs text-white/30 uppercase tracking-wider mb-1">ip address</p>
								<p className="text-sm text-white/70 font-mono">{entry.ip}</p>
							</div>
							<div>
								<p className="text-xs text-white/30 uppercase tracking-wider mb-1">device</p>
								<p className="text-sm text-white/70">{entry.device}</p>
							</div>
							<div>
								<p className="text-xs text-white/30 uppercase tracking-wider mb-1">browser</p>
								<p className="text-sm text-white/70">{entry.browser}</p>
							</div>
							{entry.location && (
								<div>
									<p className="text-xs text-white/30 uppercase tracking-wider mb-1">location</p>
									<p className="text-sm text-white/70">{entry.location}</p>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default function Audit() {
	const [actionFilter, setActionFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [page, setPage] = useState(0);
	const [expanded, setExpanded] = useState<string | null>(null);

	const filtered = mockdata.filter((entry) => {
		if (actionFilter !== "all" && entry.action !== actionFilter) return false;
		if (statusFilter !== "all" && entry.status !== statusFilter) return false;
		return true;
	});

	const total = filtered.length;
	const pages = Math.ceil(total / PER_PAGE);
	const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

	const grouped = paginated.reduce((acc, entry) => {
		const date = new Date(entry.timestamp).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
		if (!acc[date]) acc[date] = [];
		acc[date].push(entry);
		return acc;
	}, {} as Record<string, AuditEntry[]>);

	return (
		<Page>
			<Header title="audit log" description="detailed security and access history" />

			<div className="flex flex-wrap items-center gap-3 mb-8">
				<Select value={actionFilter} onChange={(v) => { setActionFilter(v); setPage(0); }} options={actions} />
				<Select value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(0); }} options={statuses} />
				{(actionFilter !== "all" || statusFilter !== "all") && (
					<button
						onClick={() => { setActionFilter("all"); setStatusFilter("all"); setPage(0); }}
						className="px-4 py-2.5 text-sm text-white/40 hover:text-white/70 transition-colors"
					>
						clear filters
					</button>
				)}
				<div className="flex-1" />
				<p className="text-sm text-white/30">{total} entries</p>
			</div>

			{paginated.length === 0 ? (
				<Empty
					icon={
						<svg className="w-7 h-7 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
						</svg>
					}
					title="no audit entries found"
					description="try adjusting your filters"
				/>
			) : (
				<div className="space-y-8">
					{Object.entries(grouped).map(([date, entries]) => (
						<div key={date}>
							<h2 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-4 pl-8">{date}</h2>
							<div className="space-y-3 relative">
								<div className="absolute left-[5px] top-3 bottom-3 w-px bg-white/10" />
								{entries.map((entry) => (
									<Entry
										key={entry.id}
										entry={entry}
										expanded={expanded === entry.id}
										onToggle={() => setExpanded(expanded === entry.id ? null : entry.id)}
									/>
								))}
							</div>
						</div>
					))}
				</div>
			)}

			{pages > 1 && (
				<div className="mt-8 flex items-center justify-between">
					<p className="text-sm text-white/30">
						{page * PER_PAGE + 1}-{Math.min((page + 1) * PER_PAGE, total)} of {total}
					</p>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setPage(Math.max(0, page - 1))}
							disabled={page === 0}
							className="px-4 py-2 text-sm bg-[#161616] border border-white/5 rounded-lg hover:border-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white/70"
						>
							previous
						</button>
						<button
							onClick={() => setPage(Math.min(pages - 1, page + 1))}
							disabled={page >= pages - 1}
							className="px-4 py-2 text-sm bg-[#161616] border border-white/5 rounded-lg hover:border-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white/70"
						>
							next
						</button>
					</div>
				</div>
			)}
		</Page>
	);
}
