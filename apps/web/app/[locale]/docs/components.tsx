"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getprevnext } from "./config";

const linkIcon = (
	<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<path d="M6.5 9.5l3-3M7 11.5l-1.5 1.5a2.121 2.121 0 01-3-3L4 8.5M9 4.5l1.5-1.5a2.121 2.121 0 013 3L12 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const copyIcon = (
	<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
		<path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" stroke="currentColor" strokeWidth="1.5" />
	</svg>
);

const checkIcon = (
	<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<path d="M3 8l4 4 6-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

function Anchor({ id }: { id?: string }) {
	const [copied, setCopied] = useState(false);
	const pathname = usePathname();

	if (!id) return null;

	const copy = async () => {
		const url = `${window.location.origin}${pathname}#${id}`;
		await navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			type="button"
			onClick={copy}
			className={`opacity-0 group-hover/heading:opacity-100 p-1 rounded transition-all ${
				copied ? "text-[#d4b08c] opacity-100" : "text-white/30 hover:text-white/60"
			}`}
			title="Copy link"
		>
			{copied ? checkIcon : linkIcon}
		</button>
	);
}

export function Header({
	section,
	title,
	description,
	id,
}: {
	section: string;
	title: string;
	description: string;
	id?: string;
}) {
	return (
		<div className="mb-8 md:mb-12">
			<p className="text-xs md:text-sm text-white/40 mb-2">{section}</p>
			<div className="flex items-center gap-2 group/heading">
				<h1 id={id} className="text-3xl md:text-5xl font-semibold tracking-tight text-[#ededed]">
					{title}
				</h1>
				<Anchor id={id} />
			</div>
			<p className="text-base md:text-xl text-white/60 max-w-2xl mt-4 md:mt-6">{description}</p>
		</div>
	);
}

export function Code({ children, className = "" }: { children: string; className?: string }) {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		await navigator.clipboard.writeText(children);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className={`relative group/code my-4 ${className}`}>
			<button
				type="button"
				onClick={copy}
				className={`absolute top-3 right-3 md:top-4 md:right-4 p-1.5 md:p-2 rounded-lg transition-all ${
					copied
						? "text-[#d4b08c] bg-[#d4b08c]/20"
						: "text-white/30 hover:text-white/60 hover:bg-white/10 opacity-0 group-hover/code:opacity-100"
				}`}
				title="Copy code"
			>
				{copied ? checkIcon : copyIcon}
			</button>
			<pre 
				className="bg-[#0a0a0a] text-[#e5e5e5] p-4 md:p-5 rounded-xl text-xs md:text-sm leading-relaxed overflow-x-auto border border-white/10"
				style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Cascadia Code', 'Consolas', 'DejaVu Sans Mono', 'Liberation Mono', monospace" }}
			>
				{children}
			</pre>
		</div>
	);
}

export function Codeinline({ children, className = "" }: { children: string; className?: string }) {
	return (
		<code className={`bg-[#d4b08c]/10 text-[#d4b08c] px-1.5 py-0.5 rounded text-sm font-mono ${className}`}>
			{children}
		</code>
	);
}

export function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
	return (
		<div className="my-4 overflow-x-auto">
			<table className="w-full text-sm border-collapse">
				<thead>
					<tr className="border-b border-white/10">
						{headers.map((header) => (
							<th
								key={header}
								className="text-left py-3 px-4 text-[#ededed] font-medium first:pl-0 last:pr-0"
							>
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.join("-")} className="border-b border-white/5 last:border-0">
							{row.map((cell) => (
								<td
									key={cell}
									className="py-3 px-4 text-white/60 first:pl-0 last:pr-0 first:text-[#d4b08c] first:font-mono"
								>
									{cell}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function Prevnext() {
	const pathname = usePathname();
	const router = useRouter();
	const { prev, next } = getprevnext(pathname);

	useEffect(() => {
		const handlekey = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
			if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

			if (e.key === "ArrowLeft" && prev) {
				router.push(prev.href);
			} else if (e.key === "ArrowRight" && next) {
				router.push(next.href);
			}
		};

		window.addEventListener("keydown", handlekey);
		return () => window.removeEventListener("keydown", handlekey);
	}, [prev, next, router]);

	return (
		<div className="flex items-center justify-between pt-8 border-t border-white/10">
			{prev ? (
				<Link
					href={prev.href}
					className="text-sm text-white/50 hover:text-white transition-colors"
				>
					← {prev.title}
				</Link>
			) : (
				<span />
			)}
			{next ? (
				<Link
					href={next.href}
					className="text-sm text-white/50 hover:text-white transition-colors"
				>
					{next.title} →
				</Link>
			) : (
				<span />
			)}
		</div>
	);
}

export function Card({
	title,
	description,
	code,
}: {
	title?: string;
	description: string;
	code?: string;
}) {
	return (
		<div className="p-4 border border-white/10 rounded-xl bg-white/5">
			{code && <code className="text-sm text-[#d4b08c]">{code}</code>}
			{title && <h4 className="text-sm font-medium text-[#ededed] mb-1">{title}</h4>}
			<p className={`text-white/50 ${code ? "text-xs mt-1" : "text-sm"}`}>{description}</p>
		</div>
	);
}

export function Section({
	id,
	title,
	children,
}: {
	id: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="mb-10 md:mb-12 overflow-hidden">
			<div className="flex items-center gap-2 mb-4 group/heading">
				<h2 id={id} className="text-xl md:text-2xl font-semibold text-[#ededed]">
					{title}
				</h2>
				<Anchor id={id} />
			</div>
			{children}
		</section>
	);
}
