import { useState, useMemo } from "react";
import type { RemoteItem } from "../hooks/sync";
import { typeicons } from "./item";

type ItemType = "all" | "login" | "note" | "card" | "identity" | "ssh" | "api" | "otp" | "passkey";

interface Props {
	items: RemoteItem[];
	selected: string | null;
	onSelect: (id: string) => void;
	loading?: boolean;
}

const types: { id: ItemType; label: string }[] = [
	{ id: "all", label: "all" },
	{ id: "login", label: "logins" },
	{ id: "note", label: "notes" },
	{ id: "card", label: "cards" },
	{ id: "identity", label: "identities" },
	{ id: "ssh", label: "ssh keys" },
	{ id: "api", label: "api keys" },
	{ id: "otp", label: "otp" },
	{ id: "passkey", label: "passkeys" },
];

export function Itemlist({ items, selected, onSelect, loading }: Props) {
	const [search, setSearch] = useState("");
	const [typefilter, setTypefilter] = useState<ItemType>("all");
	const [showfavorites, setShowfavorites] = useState(false);

	const filtered = useMemo(() => {
		return items.filter((item) => {
			if (item.deleted) return false;
			if (showfavorites && !item.favorite) return false;
			if (typefilter !== "all" && item.type !== typefilter) return false;
			if (search) {
				const lower = search.toLowerCase();
				const matchestitle = item.title.toLowerCase().includes(lower);
				const matchestags = item.tags.some((t) => t.name.toLowerCase().includes(lower));
				if (!matchestitle && !matchestags) return false;
			}
			return true;
		});
	}, [items, search, typefilter, showfavorites]);

	const grouped = useMemo(() => {
		const favorites = filtered.filter((i) => i.favorite);
		const others = filtered.filter((i) => !i.favorite);
		return { favorites, others };
	}, [filtered]);

	return (
		<div className="itemlist">
			<div className="itemlist-search">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
				<input
					type="text"
					placeholder="search items..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				{search && (
					<button type="button" className="clear-btn" onClick={() => setSearch("")}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				)}
			</div>

			<div className="itemlist-filters">
				<select value={typefilter} onChange={(e) => setTypefilter(e.target.value as ItemType)}>
					{types.map((t) => (
						<option key={t.id} value={t.id}>{t.label}</option>
					))}
				</select>
				<button
					type="button"
					className={`favorites-toggle ${showfavorites ? "active" : ""}`}
					onClick={() => setShowfavorites(!showfavorites)}
				>
					★
				</button>
			</div>

			<div className="itemlist-items">
				{loading ? (
					<div className="itemlist-empty">
						<span>loading...</span>
					</div>
				) : filtered.length === 0 ? (
					<div className="itemlist-empty">
						<span>{search ? "no matches" : "no items"}</span>
					</div>
				) : (
					<>
						{grouped.favorites.length > 0 && (
							<div className="itemlist-group">
								<div className="itemlist-group-title">favorites</div>
								{grouped.favorites.map((item) => (
									<Itemrow
										key={item.id}
										item={item}
										selected={selected === item.id}
										onSelect={() => onSelect(item.id)}
									/>
								))}
							</div>
						)}
						{grouped.others.length > 0 && (
							<div className="itemlist-group">
								{grouped.favorites.length > 0 && (
									<div className="itemlist-group-title">all items</div>
								)}
								{grouped.others.map((item) => (
									<Itemrow
										key={item.id}
										item={item}
										selected={selected === item.id}
										onSelect={() => onSelect(item.id)}
									/>
								))}
							</div>
						)}
					</>
				)}
			</div>

			<style>{`
				.itemlist {
					display: flex;
					flex-direction: column;
					height: 100%;
					background: var(--bg);
				}
				.itemlist-search {
					position: relative;
					padding: 0.75rem 1rem;
					border-bottom: 1px solid var(--border);
				}
				.itemlist-search svg {
					position: absolute;
					left: 1.625rem;
					top: 50%;
					transform: translateY(-50%);
					width: 1rem;
					height: 1rem;
					color: var(--fg-subtle);
					pointer-events: none;
				}
				.itemlist-search input {
					width: 100%;
					padding: 0.625rem 2.25rem;
					background: var(--bg-elevated);
					border: 1px solid var(--border);
					border-radius: var(--radius-sm);
					color: var(--fg);
					font-size: 0.8125rem;
					transition: var(--transition);
				}
				.itemlist-search input:focus {
					outline: none;
					border-color: var(--accent);
				}
				.itemlist-search input::placeholder {
					color: var(--fg-subtle);
				}
				.clear-btn {
					position: absolute;
					right: 1.25rem;
					top: 50%;
					transform: translateY(-50%);
					width: 24px;
					height: 24px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: none;
					border: none;
					color: var(--fg-subtle);
					cursor: pointer;
					border-radius: 4px;
				}
				.clear-btn:hover {
					color: var(--fg);
				}
				.clear-btn svg {
					position: static;
					transform: none;
					width: 14px;
					height: 14px;
				}
				.itemlist-filters {
					display: flex;
					gap: 0.5rem;
					padding: 0.75rem 1rem;
					border-bottom: 1px solid var(--border);
				}
				.itemlist-filters select {
					flex: 1;
					padding: 0.5rem 0.75rem;
					background: var(--bg-elevated);
					border: 1px solid var(--border);
					border-radius: var(--radius-sm);
					color: var(--fg);
					font-size: 0.8125rem;
					cursor: pointer;
				}
				.itemlist-filters select:focus {
					outline: none;
					border-color: var(--accent);
				}
				.favorites-toggle {
					width: 34px;
					height: 34px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: var(--bg-elevated);
					border: 1px solid var(--border);
					border-radius: var(--radius-sm);
					color: var(--fg-muted);
					cursor: pointer;
					transition: var(--transition);
					font-size: 0.875rem;
				}
				.favorites-toggle:hover {
					border-color: var(--accent);
					color: var(--accent);
				}
				.favorites-toggle.active {
					background: rgba(212, 176, 140, 0.1);
					border-color: var(--accent);
					color: var(--accent);
				}
				.itemlist-items {
					flex: 1;
					overflow-y: auto;
				}
				.itemlist-empty {
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 3rem 1rem;
					color: var(--fg-muted);
					font-size: 0.875rem;
				}
				.itemlist-group {
					padding: 0.5rem 0;
				}
				.itemlist-group-title {
					padding: 0.5rem 1rem;
					font-size: 0.6875rem;
					font-weight: 600;
					color: var(--fg-subtle);
					text-transform: uppercase;
					letter-spacing: 0.05em;
				}
			`}</style>
		</div>
	);
}

function Itemrow({
	item,
	selected,
	onSelect,
}: {
	item: RemoteItem;
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			className={`itemrow ${selected ? "selected" : ""}`}
			onClick={onSelect}
		>
			<div className="itemrow-icon">
				{typeicons[item.type] || typeicons.note}
			</div>
			<div className="itemrow-content">
				<div className="itemrow-title">{item.title}</div>
				<div className="itemrow-type">{item.type}</div>
			</div>
			{item.favorite && <span className="itemrow-star">★</span>}

			<style>{`
				.itemrow {
					display: flex;
					align-items: center;
					gap: 0.75rem;
					width: 100%;
					padding: 0.75rem 1rem;
					background: none;
					border: none;
					color: var(--fg);
					cursor: pointer;
					text-align: left;
					transition: var(--transition);
				}
				.itemrow:hover {
					background: var(--bg-subtle);
				}
				.itemrow.selected {
					background: var(--bg-elevated);
					border-right: 2px solid var(--accent);
				}
				.itemrow-icon {
					width: 32px;
					height: 32px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: rgba(212, 176, 140, 0.1);
					border-radius: 6px;
					color: var(--accent);
					flex-shrink: 0;
				}
				.itemrow-icon svg {
					width: 1rem;
					height: 1rem;
				}
				.itemrow-content {
					flex: 1;
					min-width: 0;
				}
				.itemrow-title {
					font-size: 0.8125rem;
					font-weight: 500;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.itemrow-type {
					font-size: 0.6875rem;
					color: var(--fg-muted);
					margin-top: 0.125rem;
				}
				.itemrow-star {
					color: var(--accent);
					font-size: 0.75rem;
					flex-shrink: 0;
				}
			`}</style>
		</button>
	);
}
