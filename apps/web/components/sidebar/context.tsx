"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useShortcuts } from "@/hooks/shortcuts";
import { Shortcuts } from "@/components/shortcuts";

type Callbacks = {
	new: (() => void) | null;
	search: (() => void) | null;
	copy: (() => void) | null;
	escape: (() => void) | null;
};

interface SidebarContextValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	collapsed: boolean;
	setCollapsed: (collapsed: boolean) => void;
	toggleCollapsed: () => void;
	register: (key: keyof Callbacks, fn: (() => void) | null) => void;
	selectedItem: string | null;
	setSelectedItem: (id: string | null) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
	open: false,
	setOpen: () => {},
	collapsed: false,
	setCollapsed: () => {},
	toggleCollapsed: () => {},
	register: () => {},
	selectedItem: null,
	setSelectedItem: () => {},
});

export function useSidebar() {
	return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [collapsed, setCollapsed] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
	const [selectedItem, setSelectedItem] = useState<string | null>(null);
	const callbacks = useRef<Callbacks>({ new: null, search: null, copy: null, escape: null });

	const register = useCallback((key: keyof Callbacks, fn: (() => void) | null) => {
		callbacks.current[key] = fn;
	}, []);

	const toggleCollapsed = useCallback(() => {
		setCollapsed((c) => !c);
	}, []);

	useShortcuts({
		search: () => {
			if (callbacks.current.search) callbacks.current.search();
		},
		new: () => {
			const isVault = pathname.endsWith("/vault") || pathname.endsWith("/vault/vault");
			if (!isVault) {
				router.push("/vault");
			} else if (callbacks.current.new) {
				callbacks.current.new();
			}
		},
		generator: () => router.push("/vault/generator"),
		settings: () => router.push("/vault/settings"),
		help: () => setShowHelp((v) => !v),
		copy: () => {
			if (callbacks.current.copy) callbacks.current.copy();
		},
		escape: () => {
			if (showHelp) {
				setShowHelp(false);
			} else if (open) {
				setOpen(false);
			} else if (callbacks.current.escape) {
				callbacks.current.escape();
			}
		},
	});

	useEffect(() => {
		setOpen(false);
		setSelectedItem(null);
	}, [pathname]);

	return (
		<SidebarContext.Provider value={{ open, setOpen, collapsed, setCollapsed, toggleCollapsed, register, selectedItem, setSelectedItem }}>
			{children}
			<Shortcuts open={showHelp} onClose={() => setShowHelp(false)} />
		</SidebarContext.Provider>
	);
}
