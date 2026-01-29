"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { ItemType } from "@/lib/generated/prisma/enums";
import * as store from "@/app/[locale]/vault/vault/store";
import type { VaultItem } from "@/app/[locale]/vault/vault/store";
import { type CommandDef, type Category, loadrecent, saverecent, fuzzy, score, icons, navicons } from "@/lib/command";

interface Props {
	onnewitem?: (type: ItemType) => void;
	onexport?: () => void;
	onlock?: () => void;
}

export function Command({ onnewitem, onexport, onlock }: Props) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState(0);
	const [recent, setRecent] = useState<string[]>([]);
	const [items, setItems] = useState<VaultItem[]>([]);
	const inputref = useRef<HTMLInputElement>(null);
	const listref = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const pathname = usePathname();

	const isinapp = pathname.includes("/vault");

	useEffect(() => {
		setRecent(loadrecent());
		if (isinapp) {
			store.load().then((data) => setItems(data.filter((i) => !i.deleted)));
		}
	}, [isinapp]);

	const commands = useMemo<CommandDef[]>(() => {
		const base: CommandDef[] = [
			{ id: "new-login", label: "new login", category: "actions", icon: icons.login, action: () => onnewitem?.("login"), keywords: ["password", "credential"] },
			{ id: "new-note", label: "new note", category: "actions", icon: icons.note, action: () => onnewitem?.("note"), keywords: ["text", "secure"] },
			{ id: "new-card", label: "new card", category: "actions", icon: icons.card, action: () => onnewitem?.("card"), keywords: ["credit", "debit", "payment"] },
			{ id: "new-identity", label: "new identity", category: "actions", icon: icons.identity, action: () => onnewitem?.("identity"), keywords: ["personal", "info"] },
			{ id: "new-ssh", label: "new ssh key", category: "actions", icon: icons.ssh, action: () => onnewitem?.("ssh"), keywords: ["terminal", "server"] },
			{ id: "new-api", label: "new api key", category: "actions", icon: icons.api, action: () => onnewitem?.("api"), keywords: ["token", "secret"] },
			{ id: "new-otp", label: "new otp", category: "actions", icon: icons.otp, action: () => onnewitem?.("otp"), keywords: ["2fa", "totp", "authenticator"] },
			{ id: "new-passkey", label: "new passkey", category: "actions", icon: icons.passkey, action: () => onnewitem?.("passkey"), keywords: ["webauthn", "biometric"] },
			{ id: "generator", label: "open generator", category: "actions", icon: navicons.generator, action: () => router.push("/vault/generator"), keywords: ["password", "random", "generate"] },
			{ id: "settings", label: "open settings", category: "actions", icon: navicons.settings, action: () => router.push("/vault/settings"), keywords: ["preferences", "config"] },
			{ id: "search", label: "search vault", category: "actions", icon: navicons.search, action: () => router.push("/vault"), keywords: ["find", "lookup"] },
			{ id: "export", label: "export vault", category: "actions", icon: navicons.export, action: () => onexport?.(), keywords: ["backup", "download"] },
			{ id: "lock", label: "lock vault", category: "actions", icon: navicons.vault, action: () => onlock?.(), keywords: ["logout", "secure"] },
		];
		const nav: CommandDef[] = [
			{ id: "nav-vault", label: "go to vault", category: "navigation", icon: navicons.vault, action: () => router.push("/vault"), keywords: ["home", "main"] },
			{ id: "nav-generator", label: "go to generator", category: "navigation", icon: navicons.generator, action: () => router.push("/vault/generator"), keywords: ["password"] },
			{ id: "nav-settings", label: "go to settings", category: "navigation", icon: navicons.settings, action: () => router.push("/vault/settings"), keywords: ["preferences"] },
			{ id: "nav-docs", label: "go to docs", category: "navigation", icon: navicons.docs, action: () => router.push("/docs"), keywords: ["help", "documentation"] },
			{ id: "nav-home", label: "go to home", category: "navigation", icon: navicons.home, action: () => router.push("/"), keywords: ["landing"] },
		];
		const vaultitems: CommandDef[] = items.map((item) => ({
			id: `item-${item.id}`,
			label: item.title,
			category: "items" as Category,
			icon: icons[item.type],
			action: () => router.push(`/vault?item=${item.id}`),
			keywords: item.tags,
		}));
		return [...base, ...nav, ...vaultitems];
	}, [router, items, onnewitem, onexport, onlock]);

	const filtered = useMemo(() => {
		if (!query) {
			const recentcmds = recent.map((id) => commands.find((c) => c.id === id)).filter(Boolean) as CommandDef[];
			return { recent: recentcmds, actions: commands.filter((c) => c.category === "actions").slice(0, 6), items: [] as CommandDef[], navigation: commands.filter((c) => c.category === "navigation") };
		}
		const matches = commands.filter((c) => fuzzy([c.label, ...(c.keywords || [])].join(" "), query));
		matches.sort((a, b) => score([b.label, ...(b.keywords || [])].join(" "), query) - score([a.label, ...(a.keywords || [])].join(" "), query));
		return { recent: [] as CommandDef[], actions: matches.filter((c) => c.category === "actions"), items: matches.filter((c) => c.category === "items"), navigation: matches.filter((c) => c.category === "navigation") };
	}, [query, commands, recent]);

	const allvisible = useMemo(() => [...filtered.recent, ...filtered.actions, ...filtered.items, ...filtered.navigation], [filtered]);

	const execute = useCallback((cmd: CommandDef) => {
		const newrecent = [cmd.id, ...recent.filter((id) => id !== cmd.id)].slice(0, 5);
		setRecent(newrecent);
		saverecent(newrecent);
		setOpen(false);
		setQuery("");
		cmd.action();
	}, [recent]);

	const handlekeydown = useCallback((e: KeyboardEvent) => {
		if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen((o) => !o); setQuery(""); setSelected(0); return; }
		if (!open) return;
		if (e.key === "Escape") { e.preventDefault(); setOpen(false); setQuery(""); return; }
		if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, allvisible.length - 1)); return; }
		if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); return; }
		if (e.key === "Enter") { e.preventDefault(); const cmd = allvisible[selected]; if (cmd) execute(cmd); return; }
	}, [open, selected, allvisible, execute]);

	useEffect(() => { window.addEventListener("keydown", handlekeydown); return () => window.removeEventListener("keydown", handlekeydown); }, [handlekeydown]);
	useEffect(() => { if (open && inputref.current) inputref.current.focus(); }, [open]);
	useEffect(() => { setSelected(0); }, [query]);
	useEffect(() => { if (listref.current) { const el = listref.current.querySelector(`[data-index="${selected}"]`); if (el) el.scrollIntoView({ block: "nearest" }); } }, [selected]);
	useEffect(() => { setOpen(false); }, [pathname]);

	if (!open) return null;

	let index = 0;

	return (
		<div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
			<div className="relative bg-[#161616] border border-white/10 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
				<div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
					<svg aria-hidden="true" className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={navicons.search} />
					</svg>
					<input ref={inputref} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="search commands..." className="flex-1 bg-transparent border-0 outline-none text-white placeholder:text-white/40" />
					<kbd className="px-2 py-1 text-[10px] font-mono bg-white/10 rounded text-white/40">esc</kbd>
				</div>
				<div ref={listref} className="max-h-[50vh] overflow-y-auto p-2">
					{allvisible.length === 0 ? (
						<div className="px-4 py-8 text-center text-white/40 text-sm">no results found</div>
					) : (
						<>
							{filtered.recent.length > 0 && <Section label="recent">{filtered.recent.map((cmd) => <Item key={cmd.id} cmd={cmd} selected={selected === index} index={index++} onselect={() => execute(cmd)} onhover={() => setSelected(index - 1)} />)}</Section>}
							{filtered.actions.length > 0 && <Section label="actions">{filtered.actions.map((cmd) => <Item key={cmd.id} cmd={cmd} selected={selected === index} index={index++} onselect={() => execute(cmd)} onhover={() => setSelected(index - 1)} />)}</Section>}
							{filtered.items.length > 0 && <Section label="items">{filtered.items.map((cmd) => <Item key={cmd.id} cmd={cmd} selected={selected === index} index={index++} onselect={() => execute(cmd)} onhover={() => setSelected(index - 1)} />)}</Section>}
							{filtered.navigation.length > 0 && <Section label="navigation">{filtered.navigation.map((cmd) => <Item key={cmd.id} cmd={cmd} selected={selected === index} index={index++} onselect={() => execute(cmd)} onhover={() => setSelected(index - 1)} />)}</Section>}
						</>
					)}
				</div>
				<div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/30">
					<div className="flex items-center gap-4">
						<span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 font-mono bg-white/10 rounded">enter</kbd>select</span>
						<span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 font-mono bg-white/10 rounded">up</kbd><kbd className="px-1.5 py-0.5 font-mono bg-white/10 rounded">down</kbd>navigate</span>
					</div>
					<span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 font-mono bg-white/10 rounded">cmd</kbd><span>+</span><kbd className="px-1.5 py-0.5 font-mono bg-white/10 rounded">k</kbd></span>
				</div>
			</div>
		</div>
	);
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
	return <div className="mb-2 last:mb-0"><div className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-white/30">{label}</div>{children}</div>;
}

function Item({ cmd, selected, index, onselect, onhover }: { cmd: CommandDef; selected: boolean; index: number; onselect: () => void; onhover: () => void }) {
	return (
		<button data-index={index} onClick={onselect} onMouseEnter={onhover} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${selected ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"}`}>
			<svg aria-hidden="true" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cmd.icon} /></svg>
			<span className="flex-1 truncate">{cmd.label}</span>
		</button>
	);
}
