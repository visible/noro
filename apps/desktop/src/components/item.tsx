import { useState, type ReactNode } from "react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import type { RemoteItem } from "../hooks/sync";

interface Props {
	item: RemoteItem;
	onEdit: () => void;
	onDelete: () => void;
	onFavorite: () => void;
}

const icons: Record<string, ReactNode> = {
	login: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
			<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
			<path d="M7 11V7a5 5 0 0 1 10 0v4" />
		</svg>
	),
	note: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<polyline points="14 2 14 8 20 8" />
			<line x1="16" y1="13" x2="8" y2="13" />
			<line x1="16" y1="17" x2="8" y2="17" />
		</svg>
	),
	card: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
			<rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
			<line x1="1" y1="10" x2="23" y2="10" />
		</svg>
	),
	identity: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
			<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	),
	ssh: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
			<polyline points="4 17 10 11 4 5" />
			<line x1="12" y1="19" x2="20" y2="19" />
		</svg>
	),
	api: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
			<path d="M18 10h-4V4a2 2 0 0 0-4 0v6H6" />
			<path d="M12 10v10" />
			<path d="M2 10h6" />
			<path d="M16 10h6" />
		</svg>
	),
	otp: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
			<circle cx="12" cy="12" r="10" />
			<polyline points="12 6 12 12 16 14" />
		</svg>
	),
	passkey: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
			<path d="M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
			<path d="M12 14v8" />
			<path d="M9 18h6" />
		</svg>
	),
};

function parsedata(data: string): Record<string, string> {
	try {
		return JSON.parse(data);
	} catch {
		return {};
	}
}

export function Item({ item, onEdit, onDelete, onFavorite }: Props) {
	const [revealed, setRevealed] = useState<Record<string, boolean>>({});
	const [copied, setCopied] = useState<string | null>(null);
	const data = parsedata(item.data);

	async function copy(key: string, value: string) {
		await writeText(value);
		setCopied(key);
		setTimeout(() => setCopied(null), 1500);
	}

	function toggle(key: string) {
		setRevealed((prev) => ({ ...prev, [key]: !prev[key] }));
	}

	function mask(value: string) {
		return "•".repeat(Math.min(value.length, 24));
	}

	function sensitive(key: string) {
		const lower = key.toLowerCase();
		return (
			lower.includes("password") ||
			lower.includes("secret") ||
			lower.includes("key") ||
			lower.includes("token") ||
			lower.includes("pin") ||
			lower.includes("cvv") ||
			lower.includes("private")
		);
	}

	function renderfield(key: string, value: string) {
		const isSensitive = sensitive(key);
		const isRevealed = revealed[key];
		const display = isSensitive && !isRevealed ? mask(value) : value;

		return (
			<div className="field-row" key={key}>
				<div className="field-label">{key}</div>
				<div className="field-value">
					<span className={isSensitive && !isRevealed ? "masked" : ""}>{display}</span>
					<div className="field-actions">
						{isSensitive && (
							<button type="button" className="field-btn" onClick={() => toggle(key)}>
								{isRevealed ? (
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
										<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
										<line x1="1" y1="1" x2="23" y2="23" />
									</svg>
								) : (
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
										<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
										<circle cx="12" cy="12" r="3" />
									</svg>
								)}
							</button>
						)}
						<button
							type="button"
							className="field-btn"
							onClick={() => copy(key, value)}
						>
							{copied === key ? (
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
									<polyline points="20 6 9 17 4 12" />
								</svg>
							) : (
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
									<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
									<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
								</svg>
							)}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="item-detail">
			<div className="item-header">
				<div className="item-icon-lg">{icons[item.type] || icons.note}</div>
				<div className="item-meta">
					<h2>{item.title}</h2>
					<span className="item-type-badge">{item.type}</span>
				</div>
				<div className="item-header-actions">
					<button
						type="button"
						className={`favorite-btn ${item.favorite ? "active" : ""}`}
						onClick={onFavorite}
					>
						{item.favorite ? "★" : "☆"}
					</button>
					<button type="button" className="action-btn" onClick={onEdit}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
							<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
							<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
						</svg>
					</button>
					<button type="button" className="action-btn danger" onClick={onDelete}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
							<polyline points="3 6 5 6 21 6" />
							<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
						</svg>
					</button>
				</div>
			</div>

			{item.tags.length > 0 && (
				<div className="item-tags">
					{item.tags.map((tag) => (
						<span key={tag.id} className="tag">{tag.name}</span>
					))}
				</div>
			)}

			<div className="item-fields">
				{Object.entries(data).map(([key, value]) => renderfield(key, String(value)))}
			</div>

			<style>{`
				.item-detail {
					padding: 1.5rem;
				}
				.item-header {
					display: flex;
					align-items: flex-start;
					gap: 1rem;
					margin-bottom: 1.5rem;
				}
				.item-icon-lg {
					width: 48px;
					height: 48px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: rgba(212, 176, 140, 0.1);
					border-radius: var(--radius-sm);
					color: var(--accent);
					flex-shrink: 0;
				}
				.item-icon-lg svg {
					width: 1.5rem;
					height: 1.5rem;
				}
				.item-meta {
					flex: 1;
					min-width: 0;
				}
				.item-meta h2 {
					font-size: 1.25rem;
					font-weight: 600;
					margin-bottom: 0.25rem;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.item-type-badge {
					font-size: 0.75rem;
					color: var(--accent);
					background: rgba(212, 176, 140, 0.1);
					padding: 0.25rem 0.5rem;
					border-radius: 4px;
				}
				.item-header-actions {
					display: flex;
					gap: 0.5rem;
				}
				.favorite-btn {
					width: 32px;
					height: 32px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: none;
					border: 1px solid var(--border);
					color: var(--fg-muted);
					cursor: pointer;
					border-radius: var(--radius-sm);
					transition: var(--transition);
					font-size: 1rem;
				}
				.favorite-btn:hover {
					border-color: var(--accent);
					color: var(--accent);
				}
				.favorite-btn.active {
					color: var(--accent);
					border-color: var(--accent);
				}
				.action-btn {
					width: 32px;
					height: 32px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: none;
					border: 1px solid var(--border);
					color: var(--fg-muted);
					cursor: pointer;
					border-radius: var(--radius-sm);
					transition: var(--transition);
				}
				.action-btn svg {
					width: 1rem;
					height: 1rem;
				}
				.action-btn:hover {
					border-color: var(--accent);
					color: var(--accent);
				}
				.action-btn.danger:hover {
					border-color: #ef4444;
					color: #ef4444;
				}
				.item-tags {
					display: flex;
					flex-wrap: wrap;
					gap: 0.5rem;
					margin-bottom: 1.5rem;
				}
				.tag {
					font-size: 0.75rem;
					color: var(--fg-muted);
					background: var(--bg-subtle);
					padding: 0.25rem 0.625rem;
					border-radius: 4px;
				}
				.item-fields {
					display: flex;
					flex-direction: column;
					gap: 0.75rem;
				}
				.field-row {
					display: flex;
					flex-direction: column;
					gap: 0.375rem;
					padding: 0.875rem 1rem;
					background: var(--bg-elevated);
					border: 1px solid var(--border);
					border-radius: var(--radius-sm);
				}
				.field-label {
					font-size: 0.75rem;
					color: var(--fg-muted);
					text-transform: lowercase;
				}
				.field-value {
					display: flex;
					align-items: center;
					gap: 0.5rem;
				}
				.field-value span {
					flex: 1;
					font-size: 0.875rem;
					font-family: monospace;
					word-break: break-all;
				}
				.field-value .masked {
					color: var(--fg-subtle);
					letter-spacing: 2px;
				}
				.field-actions {
					display: flex;
					gap: 0.25rem;
					flex-shrink: 0;
				}
				.field-btn {
					width: 28px;
					height: 28px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: none;
					border: none;
					color: var(--fg-subtle);
					cursor: pointer;
					border-radius: 4px;
					transition: var(--transition);
				}
				.field-btn:hover {
					color: var(--accent);
					background: rgba(212, 176, 140, 0.1);
				}
				.field-btn svg {
					width: 14px;
					height: 14px;
				}
			`}</style>
		</div>
	);
}

export { icons as typeicons };
