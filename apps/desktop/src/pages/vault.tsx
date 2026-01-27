import { useState, useEffect } from "react";
import { useSync, type RemoteItem } from "../hooks/sync";

interface Props {
	user: { email: string };
	token: string;
	onLogout: () => void;
	onNavigate: (view: "vault" | "generator") => void;
}

const icons: Record<string, string> = {
	login: "key",
	note: "doc",
	card: "card",
	identity: "user",
	ssh: "term",
	api: "api",
};

export function Vault({ user, token, onLogout, onNavigate }: Props) {
	const { items, loading, error, fetch, create, remove } = useSync(token);
	const [search, setSearch] = useState("");
	const [adding, setAdding] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [newType, setNewType] = useState("login");

	useEffect(() => {
		fetch();
	}, [fetch]);

	const filtered = items.filter(
		(item) =>
			!item.deleted &&
			item.title.toLowerCase().includes(search.toLowerCase()),
	);

	async function handleAdd() {
		if (!newTitle.trim()) return;
		try {
			await create(newType, newTitle, "{}");
			setNewTitle("");
			setAdding(false);
		} catch {
			// ignore
		}
	}

	async function handleDelete(id: string) {
		try {
			await remove(id);
		} catch {
			// ignore
		}
	}

	return (
		<div className="vault">
			<aside className="sidebar">
				<div className="sidebar-logo">
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="M12 2L2 7l10 5 10-5-10-5z" />
						<path d="M2 17l10 5 10-5" />
						<path d="M2 12l10 5 10-5" />
					</svg>
					<span>noro</span>
				</div>

				<nav className="sidebar-nav">
					<button type="button" className="nav-item active">
						<span>vault</span>
					</button>
					<button
						type="button"
						className="nav-item"
						onClick={() => onNavigate("generator")}
					>
						<span>generator</span>
					</button>
					<button type="button" className="nav-item">
						<span>settings</span>
					</button>
				</nav>

				<div className="sidebar-footer">
					<p className="user-email">{user.email}</p>
					<button onClick={onLogout} className="logout" type="button">
						sign out
					</button>
				</div>
			</aside>

			<main className="content">
				<header className="header">
					<input
						type="text"
						placeholder="search vault..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="search"
					/>
					<button
						className="add"
						onClick={() => setAdding(true)}
						type="button"
					>
						+ add item
					</button>
					<button className="sync" onClick={() => fetch()} type="button">
						{loading ? "..." : "sync"}
					</button>
				</header>

				{error && <p className="error">{error}</p>}

				{adding && (
					<div className="add-form">
						<select
							value={newType}
							onChange={(e) => setNewType(e.target.value)}
						>
							<option value="login">login</option>
							<option value="note">note</option>
							<option value="card">card</option>
							<option value="identity">identity</option>
							<option value="ssh">ssh</option>
							<option value="api">api</option>
						</select>
						<input
							type="text"
							placeholder="title"
							value={newTitle}
							onChange={(e) => setNewTitle(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleAdd()}
						/>
						<button onClick={handleAdd} type="button">
							save
						</button>
						<button onClick={() => setAdding(false)} type="button">
							cancel
						</button>
					</div>
				)}

				<div className="items">
					{filtered.length === 0 ? (
						<div className="empty">
							<p>{loading ? "loading..." : "no items found"}</p>
						</div>
					) : (
						filtered.map((item) => (
							<ItemRow
								key={item.id}
								item={item}
								onDelete={() => handleDelete(item.id)}
							/>
						))
					)}
				</div>
			</main>

			<style>{`
				.vault {
					display: flex;
					min-height: 100vh;
				}
				.sidebar {
					width: 240px;
					border-right: 1px solid var(--border);
					padding: 1.5rem;
					display: flex;
					flex-direction: column;
				}
				.sidebar-logo {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					font-weight: bold;
					margin-bottom: 2rem;
				}
				.sidebar-logo svg {
					width: 1.5rem;
					height: 1.5rem;
					color: var(--accent);
				}
				.sidebar-nav {
					flex: 1;
					display: flex;
					flex-direction: column;
					gap: 0.25rem;
				}
				.nav-item {
					display: flex;
					align-items: center;
					gap: 0.75rem;
					padding: 0.75rem 1rem;
					border-radius: 0.5rem;
					color: var(--muted);
					text-decoration: none;
					transition: all 0.15s;
					background: none;
					border: none;
					width: 100%;
					text-align: left;
					cursor: pointer;
					font-size: 1rem;
				}
				.nav-item:hover {
					color: var(--fg);
					background: rgba(255, 255, 255, 0.05);
				}
				.nav-item.active {
					color: var(--fg);
					background: rgba(255, 255, 255, 0.1);
				}
				.sidebar-footer {
					padding-top: 1rem;
					border-top: 1px solid var(--border);
				}
				.user-email {
					font-size: 0.875rem;
					margin-bottom: 0.5rem;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.logout {
					width: 100%;
					padding: 0.5rem;
					background: none;
					border: none;
					color: var(--muted);
					font-size: 0.875rem;
					cursor: pointer;
					text-align: left;
					border-radius: 0.5rem;
				}
				.logout:hover {
					color: var(--fg);
					background: rgba(255, 255, 255, 0.05);
				}
				.content {
					flex: 1;
					padding: 1.5rem;
				}
				.header {
					display: flex;
					gap: 1rem;
					margin-bottom: 1.5rem;
				}
				.search {
					flex: 1;
					padding: 0.75rem 1rem;
					background: rgba(255, 255, 255, 0.05);
					border: 1px solid var(--border);
					border-radius: 0.5rem;
					color: var(--fg);
					font-size: 0.875rem;
				}
				.search:focus {
					outline: none;
					border-color: var(--accent);
				}
				.add, .sync {
					padding: 0.75rem 1.5rem;
					background: var(--accent);
					color: black;
					border: none;
					border-radius: 0.5rem;
					font-weight: 600;
					cursor: pointer;
				}
				.sync {
					background: rgba(255, 255, 255, 0.1);
					color: var(--fg);
				}
				.add:hover, .sync:hover {
					opacity: 0.9;
				}
				.add-form {
					display: flex;
					gap: 0.5rem;
					margin-bottom: 1rem;
					padding: 1rem;
					background: rgba(255, 255, 255, 0.05);
					border-radius: 0.5rem;
				}
				.add-form select, .add-form input {
					padding: 0.5rem;
					background: rgba(0, 0, 0, 0.2);
					border: 1px solid var(--border);
					border-radius: 0.25rem;
					color: var(--fg);
				}
				.add-form input {
					flex: 1;
				}
				.add-form button {
					padding: 0.5rem 1rem;
					background: var(--accent);
					color: black;
					border: none;
					border-radius: 0.25rem;
					cursor: pointer;
				}
				.add-form button:last-child {
					background: rgba(255, 255, 255, 0.1);
					color: var(--fg);
				}
				.error {
					color: #ef4444;
					margin-bottom: 1rem;
					padding: 0.5rem;
					background: rgba(239, 68, 68, 0.1);
					border-radius: 0.25rem;
				}
				.items {
					display: flex;
					flex-direction: column;
					gap: 0.5rem;
				}
				.item {
					display: flex;
					align-items: center;
					gap: 1rem;
					padding: 1rem;
					background: rgba(255, 255, 255, 0.05);
					border-radius: 0.5rem;
					cursor: pointer;
					transition: background 0.15s;
				}
				.item:hover {
					background: rgba(255, 255, 255, 0.1);
				}
				.item-icon {
					width: 2rem;
					height: 2rem;
					display: flex;
					align-items: center;
					justify-content: center;
					background: rgba(255, 255, 255, 0.1);
					border-radius: 0.5rem;
					font-size: 0.75rem;
					color: var(--accent);
					font-weight: 600;
				}
				.item-info {
					flex: 1;
				}
				.item-title {
					font-weight: 500;
				}
				.item-type {
					font-size: 0.75rem;
					color: var(--muted);
				}
				.star {
					color: var(--accent);
				}
				.delete {
					padding: 0.25rem 0.5rem;
					background: rgba(239, 68, 68, 0.2);
					color: #ef4444;
					border: none;
					border-radius: 0.25rem;
					font-size: 0.75rem;
					cursor: pointer;
					opacity: 0;
					transition: opacity 0.15s;
				}
				.item:hover .delete {
					opacity: 1;
				}
				.empty {
					text-align: center;
					padding: 3rem;
					color: var(--muted);
				}
			`}</style>
		</div>
	);
}

function ItemRow({
	item,
	onDelete,
}: { item: RemoteItem; onDelete: () => void }) {
	return (
		<div className="item">
			<span className="item-icon">{icons[item.type] || "doc"}</span>
			<div className="item-info">
				<p className="item-title">{item.title}</p>
				<p className="item-type">{item.type}</p>
			</div>
			{item.favorite && <span className="star">*</span>}
			<button className="delete" onClick={onDelete} type="button">
				delete
			</button>
		</div>
	);
}
