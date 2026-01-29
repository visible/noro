import type { FolderIcon } from "@/lib/types";

export type IconName = FolderIcon | "all" | "trash" | "chevron" | "plus" | "close" | "menu" | "search" | "refresh";

const paths: Record<IconName, string> = {
	folder: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
	star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
	archive: "M21 8v13H3V8M1 3h22v5H1zM10 12h4",
	lock: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zm-7-4V5a3 3 0 016 0v2",
	globe: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
	code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
	key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
	user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8",
	all: "M4 6h16M4 12h16M4 18h16",
	trash: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6",
	chevron: "M9 18l6-6-6-6",
	plus: "M12 5v14M5 12h14",
	close: "M18 6L6 18M6 6l12 12",
	menu: "M4 6h16M4 12h16M4 18h16",
	search: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
	refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
};

interface Props {
	name: IconName;
	className?: string;
}

export function Icon({ name, className }: Props) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d={paths[name]} />
		</svg>
	);
}

export function LockIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4b08c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
			<path d="M7 11V7a5 5 0 0 1 10 0v4" />
		</svg>
	);
}

export function ClockIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4b08c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<circle cx="12" cy="12" r="10" />
			<polyline points="12 6 12 12 16 14" />
		</svg>
	);
}

export function ShieldIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4b08c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
		</svg>
	);
}

export function ArrowIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M5 12h14" />
			<path d="M12 5l7 7-7 7" />
		</svg>
	);
}
