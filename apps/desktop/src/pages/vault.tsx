import { useState, useEffect } from "react";
import { useSync, type RemoteItem } from "../hooks/sync";
import { Titlebar } from "../app";

interface Props {
	user: { email: string };
	token: string;
	onLogout: () => void;
	onNavigate: (view: "vault" | "generator") => void;
}

const typeIcons: Record<string, JSX.Element> = {
	login: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
			<path d="M7 11V7a5 5 0 0 1 10 0v4" />
		</svg>
	),
	note: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<polyline points="14 2 14 8 20 8" />
			<line x1="16" y1="13" x2="8" y2="13" />
			<line x1="16" y1="17" x2="8" y2="17" />
		</svg>
	),
	card: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
			<line x1="1" y1="10" x2="23" y2="10" />
		</svg>
	),
	identity: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	),
	ssh: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<polyline points="4 17 10 11 4 5" />
			<line x1="12" y1="19" x2="20" y2="19" />
		</svg>
	),
	api: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M18 10h-4V4a2 2 0 0 0-4 0v6H6" />
			<path d="M12 10v10" />
			<path d="M2 10h6" />
			<path d="M16 10h6" />
		</svg>
	),
};

const navItems = [
	{
		id: "vault",
		label: "vault",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
				<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
			</svg>
		),
	},
	{
		id: "generator",
		label: "generator",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
				<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
			</svg>
		),
	},
	{
		id: "settings",
		label: "settings",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
				<circle cx="12" cy="12" r="3" />
				<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
			</svg>
		),
	},
];

export function Vault({ user, token, onLogout, onNavigate }: Props) {
	const { items, loading, error, fetch, create, remove } = useSync(token);
	const [search, setSearch] = useState("");
	const [adding, setAdding] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [newType, setNewType] = useState("login");
	const [activeNav, setActiveNav] = useState("vault");

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
		} catch {}
	}

	async function handleDelete(id: string) {
		try {
			await remove(id);
		} catch {}
	}

	function handleNavClick(id: string) {
		setActiveNav(id);
		if (id === "generator") {
			onNavigate("generator");
		}
	}

	return (
		<div className="app-container">
			<Titlebar showLogo={false} />
			<div className="vault-layout">
				<aside className="sidebar">
					<div className="sidebar-logo">
						<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path
								fill="var(--accent)"
								d="M17.5,3.875 C19.7782,3.875 21.625,5.72183 21.625,8 C21.625,9.2471 21.0714,10.36501 20.1971,11.12122 C20.4748,11.86972 20.625,12.66939 20.625,13.5 C20.625,15.89 19.382,18.0188 17.4446,19.4143 C17.1624,19.6176 16.8653,19.8054 16.5551,19.9763 L16.5183,19.9964 C15.2037,20.7125 13.6559,21.125 12,21.125 C10.34411,21.125 8.79628,20.7124 7.48166,19.9964 C7.1745,19.8291 6.88004,19.6452 6.59991,19.4462 L6.55539,19.4143 C4.61803,18.0188 3.375,15.89 3.375,13.5 C3.375,12.66939 3.52525,11.86971 3.80294,11.12122 C2.92856,10.36501 2.375,9.2471 2.375,8 C2.375,5.72183 4.22183,3.875 6.5,3.875 C8.07432,3.875 9.44244,4.75696 10.1376,6.05321 C10.73749,5.9365 11.36069,5.875 12,5.875 C12.6393,5.875 13.2625,5.9365 13.8624,6.05321 C14.5576,4.75696 15.9257,3.875 17.5,3.875 Z M13.5225,16.3968 C13.4126,16.6012 13.2228,16.7712 12.99,16.8943 C12.7145,17.04 12.3705,17.125 12,17.125 C11.62961,17.125 11.28562,17.0401 11.01014,16.8944 C10.77744,16.7713 10.58761,16.6014 10.47768,16.3971 C9.33578,16.8209 8.41869,17.7081 7.95497,18.8301 C9.1128,19.4892 10.50081,19.875 12,19.875 C13.4993,19.875 14.8874,19.4892 16.0453,18.8299 C15.7958,18.2257 15.4115,17.6816 14.9154,17.2378 C14.5045,16.8703 14.0326,16.586 13.5225,16.3968 Z M12,7.125 C7.88428,7.125 4.625,10.02458 4.625,13.5 C4.625,15.2987 5.49533,16.9402 6.9074,18.1082 C7.80618,16.1978 9.74847,14.875 12,14.875 C13.4399,14.875 14.7538,15.4162 15.7487,16.3061 C16.3092,16.8075 16.7686,17.4196 17.0926,18.1082 C18.5047,16.9402 19.375,15.2987 19.375,13.5 C19.375,10.02458 16.1157,7.125 12,7.125 Z M6.5,5.125 C4.91218,5.125 3.625,6.41218 3.625,8 C3.625,8.73272 3.90091,9.41662 4.37336,9.93541 C5.34066,8.32097 6.94287,7.05326 8.88195,6.38844 C8.35812,5.61513 7.47532,5.125 6.5,5.125 Z M17.5,5.125 C16.5254,5.125 15.6424,5.6143 15.1181,6.38845 C17.0571,7.05327 18.6593,8.32095 19.6266,9.93534 C20.1002,9.41558 20.375,8.73173 20.375,8 C20.375,6.41218 19.0878,5.125 17.5,5.125 Z"
							/>
						</svg>
						<span>noro</span>
					</div>

					<nav className="sidebar-nav">
						{navItems.map((item) => (
							<button
								key={item.id}
								type="button"
								className={`nav-item ${activeNav === item.id ? "active" : ""}`}
								onClick={() => handleNavClick(item.id)}
							>
								{item.icon}
								<span>{item.label}</span>
							</button>
						))}
					</nav>

					<div className="sidebar-footer">
						<div className="user-info">
							<div className="user-avatar">
								{user.email.charAt(0).toUpperCase()}
							</div>
							<span className="user-email">{user.email}</span>
						</div>
						<button onClick={onLogout} className="logout" type="button">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
								<polyline points="16 17 21 12 16 7" />
								<line x1="21" y1="12" x2="9" y2="12" />
							</svg>
						</button>
					</div>
				</aside>

				<main className="content">
					<header className="header">
						<div className="search-wrapper">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<circle cx="11" cy="11" r="8" />
								<path d="m21 21-4.3-4.3" />
							</svg>
							<input
								type="text"
								placeholder="search vault..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
							{search && (
								<button
									type="button"
									className="clear-search"
									onClick={() => setSearch("")}
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
									>
										<line x1="18" y1="6" x2="6" y2="18" />
										<line x1="6" y1="6" x2="18" y2="18" />
									</svg>
								</button>
							)}
						</div>
						<div className="header-actions">
							<button
								className="btn-secondary"
								onClick={() => fetch()}
								type="button"
								disabled={loading}
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M23 4v6h-6" />
									<path d="M1 20v-6h6" />
									<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
								</svg>
								{loading ? "syncing..." : "sync"}
							</button>
							<button
								className="btn-primary"
								onClick={() => setAdding(true)}
								type="button"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<line x1="12" y1="5" x2="12" y2="19" />
									<line x1="5" y1="12" x2="19" y2="12" />
								</svg>
								add item
							</button>
						</div>
					</header>

					{error && <div className="error-banner">{error}</div>}

					{adding && (
						<div className="add-modal-overlay" onClick={() => setAdding(false)}>
							<div className="add-modal" onClick={(e) => e.stopPropagation()}>
								<h3>new item</h3>
								<div className="add-form">
									<div className="field">
										<label>type</label>
										<select
											value={newType}
											onChange={(e) => setNewType(e.target.value)}
										>
											<option value="login">login</option>
											<option value="note">secure note</option>
											<option value="card">payment card</option>
											<option value="identity">identity</option>
											<option value="ssh">ssh key</option>
											<option value="api">api credential</option>
										</select>
									</div>
									<div className="field">
										<label>title</label>
										<input
											type="text"
											placeholder="e.g. GitHub, Gmail..."
											value={newTitle}
											onChange={(e) => setNewTitle(e.target.value)}
											onKeyDown={(e) => e.key === "Enter" && handleAdd()}
											autoFocus
										/>
									</div>
									<div className="add-actions">
										<button
											type="button"
											className="btn-secondary"
											onClick={() => setAdding(false)}
										>
											cancel
										</button>
										<button
											type="button"
											className="btn-primary"
											onClick={handleAdd}
											disabled={!newTitle.trim()}
										>
											create
										</button>
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="items-container">
						{filtered.length === 0 ? (
							<div className="empty-state">
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
								>
									<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
								</svg>
								<h3>{loading ? "loading..." : "no items found"}</h3>
								<p>
									{loading
										? "fetching your vault..."
										: search
											? "try a different search"
											: "add your first item to get started"}
								</p>
							</div>
						) : (
							<div className="items-grid">
								{filtered.map((item) => (
									<ItemCard
										key={item.id}
										item={item}
										onDelete={() => handleDelete(item.id)}
									/>
								))}
							</div>
						)}
					</div>
				</main>
			</div>

			<style>{`
				.vault-layout {
					flex: 1;
					display: flex;
					overflow: hidden;
				}
				.sidebar {
					width: 220px;
					background: var(--bg);
					border-right: 1px solid var(--border);
					padding: 1.25rem;
					display: flex;
					flex-direction: column;
					flex-shrink: 0;
				}
				.sidebar-logo {
					display: flex;
					align-items: center;
					gap: 0.625rem;
					font-weight: 600;
					font-size: 1.125rem;
					margin-bottom: 1.5rem;
					padding: 0 0.5rem;
					letter-spacing: -0.01em;
				}
				.sidebar-logo svg {
					width: 1.75rem;
					height: 1.75rem;
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
					padding: 0.625rem 0.75rem;
					border-radius: var(--radius-sm);
					color: var(--fg-muted);
					text-decoration: none;
					transition: var(--transition);
					background: none;
					border: none;
					width: 100%;
					text-align: left;
					cursor: pointer;
					font-size: 0.875rem;
					font-weight: 500;
				}
				.nav-item svg {
					width: 1.125rem;
					height: 1.125rem;
					flex-shrink: 0;
				}
				.nav-item:hover {
					color: var(--fg);
					background: var(--bg-subtle);
				}
				.nav-item.active {
					color: var(--fg);
					background: var(--bg-elevated);
				}
				.sidebar-footer {
					padding-top: 1rem;
					border-top: 1px solid var(--border);
					display: flex;
					align-items: center;
					gap: 0.5rem;
				}
				.user-info {
					flex: 1;
					display: flex;
					align-items: center;
					gap: 0.625rem;
					min-width: 0;
				}
				.user-avatar {
					width: 28px;
					height: 28px;
					background: var(--bg-elevated);
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 0.75rem;
					font-weight: 600;
					color: var(--accent);
					flex-shrink: 0;
				}
				.user-email {
					font-size: 0.75rem;
					color: var(--fg-muted);
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				.logout {
					width: 32px;
					height: 32px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: none;
					border: none;
					color: var(--fg-subtle);
					cursor: pointer;
					border-radius: var(--radius-sm);
					transition: var(--transition);
					flex-shrink: 0;
				}
				.logout svg {
					width: 1rem;
					height: 1rem;
				}
				.logout:hover {
					color: #ef4444;
					background: rgba(239, 68, 68, 0.1);
				}
				.content {
					flex: 1;
					display: flex;
					flex-direction: column;
					overflow: hidden;
					background: var(--bg);
				}
				.header {
					display: flex;
					align-items: center;
					gap: 1rem;
					padding: 1rem 1.5rem;
					border-bottom: 1px solid var(--border);
					flex-shrink: 0;
				}
				.search-wrapper {
					flex: 1;
					position: relative;
					max-width: 400px;
				}
				.search-wrapper svg {
					position: absolute;
					left: 0.875rem;
					top: 50%;
					transform: translateY(-50%);
					width: 1rem;
					height: 1rem;
					color: var(--fg-subtle);
					pointer-events: none;
				}
				.search-wrapper input {
					width: 100%;
					padding: 0.625rem 2.5rem 0.625rem 2.5rem;
					background: var(--bg-elevated);
					border: 1px solid var(--border);
					border-radius: var(--radius-sm);
					color: var(--fg);
					font-size: 0.875rem;
					transition: var(--transition);
				}
				.search-wrapper input:focus {
					outline: none;
					border-color: var(--accent);
					box-shadow: 0 0 0 3px rgba(212, 176, 140, 0.1);
				}
				.search-wrapper input::placeholder {
					color: var(--fg-subtle);
				}
				.clear-search {
					position: absolute;
					right: 0.5rem;
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
				.clear-search:hover {
					color: var(--fg);
					background: var(--bg-subtle);
				}
				.clear-search svg {
					position: static;
					transform: none;
					width: 14px;
					height: 14px;
				}
				.header-actions {
					display: flex;
					gap: 0.5rem;
				}
				.btn-primary, .btn-secondary {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					padding: 0.625rem 1rem;
					border-radius: var(--radius-sm);
					font-weight: 500;
					font-size: 0.8125rem;
					cursor: pointer;
					transition: var(--transition);
					border: none;
				}
				.btn-primary {
					background: var(--accent);
					color: var(--bg);
				}
				.btn-primary:hover {
					background: var(--accent-hover);
				}
				.btn-primary:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}
				.btn-secondary {
					background: var(--bg-elevated);
					color: var(--fg);
					border: 1px solid var(--border);
				}
				.btn-secondary:hover {
					background: var(--bg-subtle);
					border-color: var(--border);
				}
				.btn-secondary:disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}
				.btn-primary svg, .btn-secondary svg {
					width: 1rem;
					height: 1rem;
				}
				.error-banner {
					margin: 1rem 1.5rem 0;
					padding: 0.75rem 1rem;
					background: rgba(239, 68, 68, 0.1);
					border: 1px solid rgba(239, 68, 68, 0.2);
					border-radius: var(--radius-sm);
					color: #ef4444;
					font-size: 0.8125rem;
				}
				.add-modal-overlay {
					position: fixed;
					inset: 0;
					background: rgba(0, 0, 0, 0.6);
					display: flex;
					align-items: center;
					justify-content: center;
					z-index: 100;
					backdrop-filter: blur(4px);
				}
				.add-modal {
					width: 100%;
					max-width: 400px;
					background: var(--bg-elevated);
					border: 1px solid var(--border);
					border-radius: var(--radius-lg);
					padding: 1.5rem;
				}
				.add-modal h3 {
					font-size: 1.125rem;
					font-weight: 600;
					margin-bottom: 1.25rem;
				}
				.add-form {
					display: flex;
					flex-direction: column;
					gap: 1rem;
				}
				.add-form .field {
					display: flex;
					flex-direction: column;
					gap: 0.5rem;
				}
				.add-form label {
					font-size: 0.8125rem;
					font-weight: 500;
					color: var(--fg-muted);
				}
				.add-form input, .add-form select {
					padding: 0.75rem 1rem;
					background: var(--bg);
					border: 1px solid var(--border);
					border-radius: var(--radius-sm);
					color: var(--fg);
					font-size: 0.875rem;
				}
				.add-form input:focus, .add-form select:focus {
					outline: none;
					border-color: var(--accent);
				}
				.add-form select {
					cursor: pointer;
				}
				.add-actions {
					display: flex;
					gap: 0.75rem;
					margin-top: 0.5rem;
				}
				.add-actions button {
					flex: 1;
				}
				.items-container {
					flex: 1;
					overflow-y: auto;
					padding: 1.5rem;
				}
				.items-grid {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
					gap: 0.75rem;
				}
				.item-card {
					display: flex;
					align-items: center;
					gap: 0.875rem;
					padding: 1rem;
					background: var(--bg-elevated);
					border: 1px solid var(--border);
					border-radius: var(--radius-sm);
					cursor: pointer;
					transition: var(--transition);
				}
				.item-card:hover {
					border-color: var(--accent);
					background: var(--bg-subtle);
				}
				.item-icon {
					width: 40px;
					height: 40px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: rgba(212, 176, 140, 0.1);
					border-radius: var(--radius-sm);
					color: var(--accent);
					flex-shrink: 0;
				}
				.item-icon svg {
					width: 1.125rem;
					height: 1.125rem;
				}
				.item-info {
					flex: 1;
					min-width: 0;
				}
				.item-title {
					font-weight: 500;
					font-size: 0.875rem;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.item-type {
					font-size: 0.75rem;
					color: var(--fg-muted);
					margin-top: 0.125rem;
				}
				.item-actions {
					display: flex;
					gap: 0.25rem;
					opacity: 0;
					transition: var(--transition);
				}
				.item-card:hover .item-actions {
					opacity: 1;
				}
				.item-star {
					color: var(--accent);
					font-size: 0.875rem;
					margin-right: 0.25rem;
				}
				.item-delete {
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
				.item-delete:hover {
					color: #ef4444;
					background: rgba(239, 68, 68, 0.1);
				}
				.item-delete svg {
					width: 14px;
					height: 14px;
				}
				.empty-state {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					padding: 4rem 2rem;
					text-align: center;
				}
				.empty-state svg {
					width: 4rem;
					height: 4rem;
					color: var(--fg-subtle);
					margin-bottom: 1.5rem;
				}
				.empty-state h3 {
					font-size: 1rem;
					font-weight: 500;
					margin-bottom: 0.5rem;
				}
				.empty-state p {
					color: var(--fg-muted);
					font-size: 0.875rem;
				}
			`}</style>
		</div>
	);
}

function ItemCard({
	item,
	onDelete,
}: { item: RemoteItem; onDelete: () => void }) {
	return (
		<div className="item-card">
			<span className="item-icon">
				{typeIcons[item.type] || typeIcons.note}
			</span>
			<div className="item-info">
				<p className="item-title">{item.title}</p>
				<p className="item-type">{item.type}</p>
			</div>
			{item.favorite && <span className="item-star">★</span>}
			<div className="item-actions">
				<button
					className="item-delete"
					onClick={(e) => {
						e.stopPropagation();
						onDelete();
					}}
					type="button"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<polyline points="3 6 5 6 21 6" />
						<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
					</svg>
				</button>
			</div>
		</div>
	);
}
