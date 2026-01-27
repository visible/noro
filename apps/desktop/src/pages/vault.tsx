import { useState } from "react";

interface Props {
	user: { email: string };
	onLogout: () => void;
}

interface Item {
	id: string;
	type: string;
	title: string;
	favorite: boolean;
}

const icons: Record<string, string> = {
	login: "🔑",
	note: "📝",
	card: "💳",
	identity: "👤",
	ssh: "🖥️",
	api: "🔌",
};

export function Vault({ user, onLogout }: Props) {
	const [items] = useState<Item[]>([
		{ id: "1", type: "login", title: "GitHub", favorite: true },
		{ id: "2", type: "login", title: "Gmail", favorite: false },
		{ id: "3", type: "note", title: "SSH Keys", favorite: false },
	]);
	const [search, setSearch] = useState("");

	const filtered = items.filter((item) =>
		item.title.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className="vault">
			<aside className="sidebar">
				<div className="sidebar-logo">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M12 2L2 7l10 5 10-5-10-5z" />
						<path d="M2 17l10 5 10-5" />
						<path d="M2 12l10 5 10-5" />
					</svg>
					<span>noro</span>
				</div>

				<nav className="sidebar-nav">
					<a href="#" className="nav-item active">
						<span>🔐</span> vault
					</a>
					<a href="#" className="nav-item">
						<span>🎲</span> generator
					</a>
					<a href="#" className="nav-item">
						<span>⚙️</span> settings
					</a>
				</nav>

				<div className="sidebar-footer">
					<p className="user-email">{user.email}</p>
					<button onClick={onLogout} className="logout">
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
					<button className="add">+ add item</button>
				</header>

				<div className="items">
					{filtered.length === 0 ? (
						<div className="empty">
							<p>no items found</p>
						</div>
					) : (
						filtered.map((item) => (
							<div key={item.id} className="item">
								<span className="item-icon">{icons[item.type] || "📄"}</span>
								<div className="item-info">
									<p className="item-title">{item.title}</p>
									<p className="item-type">{item.type}</p>
								</div>
								{item.favorite && <span className="star">★</span>}
							</div>
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
				.add {
					padding: 0.75rem 1.5rem;
					background: var(--accent);
					color: black;
					border: none;
					border-radius: 0.5rem;
					font-weight: 600;
					cursor: pointer;
				}
				.add:hover {
					opacity: 0.9;
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
					font-size: 1.5rem;
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
				.empty {
					text-align: center;
					padding: 3rem;
					color: var(--muted);
				}
			`}</style>
		</div>
	);
}
