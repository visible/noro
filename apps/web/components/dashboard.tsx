"use client";

import type { ReactNode } from "react";

interface PageProps {
	children: ReactNode;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const widths = {
	sm: "max-w-xl",
	md: "max-w-2xl",
	lg: "max-w-4xl",
	xl: "max-w-5xl",
	full: "",
};

export function Page({ children, maxWidth = "lg" }: PageProps) {
	return (
		<div className="h-full overflow-y-auto scrollbar-hidden px-8 py-10">
			<div className={widths[maxWidth]}>{children}</div>
		</div>
	);
}

interface HeaderProps {
	title: string;
	description?: string;
	action?: ReactNode;
}

export function Header({ title, description, action }: HeaderProps) {
	return (
		<header className="flex items-start justify-between gap-4 mb-10">
			<div>
				<h1 className="text-2xl font-serif text-white">{title}</h1>
				{description && <p className="text-white/40 mt-1">{description}</p>}
			</div>
			{action && <div className="shrink-0">{action}</div>}
		</header>
	);
}

interface SurfaceProps {
	children: ReactNode;
	className?: string;
}

export function Surface({ children, className = "" }: SurfaceProps) {
	return (
		<div className={`bg-[#161616]/80 backdrop-blur-sm border border-white/5 rounded-xl ${className}`}>
			{children}
		</div>
	);
}

interface EmptyProps {
	icon?: ReactNode;
	title: string;
	description?: string;
	action?: ReactNode;
}

export function Empty({ icon, title, description, action }: EmptyProps) {
	return (
		<Surface className="px-6 py-16 text-center">
			{icon && (
				<div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
					{icon}
				</div>
			)}
			<p className="text-white/60 font-medium">{title}</p>
			{description && <p className="text-white/30 text-sm mt-1">{description}</p>}
			{action && <div className="mt-4">{action}</div>}
		</Surface>
	);
}

interface ButtonProps {
	children: ReactNode;
	onClick?: () => void;
	variant?: "primary" | "secondary" | "ghost";
	disabled?: boolean;
	className?: string;
}

export function Button({ children, onClick, variant = "primary", disabled, className = "" }: ButtonProps) {
	const styles = {
		primary: "bg-[#d4b08c] text-[#0a0a0a] hover:bg-[#d4b08c]/90 shadow-lg shadow-[#d4b08c]/10",
		secondary: "bg-[#161616] border border-white/5 text-white hover:border-white/10",
		ghost: "text-white/50 hover:text-white",
	};

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
		>
			{children}
		</button>
	);
}

interface StatProps {
	label: string;
	value: string | number;
	color?: string;
}

export function Stat({ label, value, color }: StatProps) {
	return (
		<div className="text-center">
			<p className="text-3xl font-bold" style={color ? { color } : { color: "#ffffff" }}>
				{value}
			</p>
			<p className="text-sm text-white/40 mt-1">{label}</p>
		</div>
	);
}

interface LoadingProps {
	text?: string;
}

export function Loading({ text = "loading..." }: LoadingProps) {
	return (
		<div className="flex flex-col items-center justify-center py-24">
			<div className="w-10 h-10 border-2 border-white/10 border-t-[#d4b08c] rounded-full animate-spin" />
			{text && <p className="text-white/40 mt-4 text-sm">{text}</p>}
		</div>
	);
}
