import type { ReactNode } from "react";
import type { RemoteItem } from "../hooks/sync";

type Category = "all" | "favorites" | "login" | "note" | "card" | "identity" | "ssh" | "api" | "otp" | "passkey";

interface Props {
	items: RemoteItem[];
	category: Category;
	onCategory: (category: Category) => void;
	user: { email: string };
	onLogout: () => void;
	onNavigate: (view: "vault" | "generator") => void;
}

const categories: { id: Category; label: string; icon: ReactNode }[] = [
	{
		id: "all",
		label: "all items",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
				<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
			</svg>
		),
	},
	{
		id: "favorites",
		label: "favorites",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
				<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
			</svg>
		),
	},
	{
		id: "login",
		label: "logins",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
				<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
				<path d="M7 11V7a5 5 0 0 1 10 0v4" />
			</svg>
		),
	},
	{
		id: "note",
		label: "notes",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
				<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
				<polyline points="14 2 14 8 20 8" />
				<line x1="16" y1="13" x2="8" y2="13" />
				<line x1="16" y1="17" x2="8" y2="17" />
			</svg>
		),
	},
	{
		id: "card",
		label: "cards",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
				<rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
				<line x1="1" y1="10" x2="23" y2="10" />
			</svg>
		),
	},
	{
		id: "identity",
		label: "identities",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
				<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
				<circle cx="12" cy="7" r="4" />
			</svg>
		),
	},
	{
		id: "ssh",
		label: "ssh keys",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
				<polyline points="4 17 10 11 4 5" />
				<line x1="12" y1="19" x2="20" y2="19" />
			</svg>
		),
	},
	{
		id: "api",
		label: "api keys",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
				<path d="M18 10h-4V4a2 2 0 0 0-4 0v6H6" />
				<path d="M12 10v10" />
				<path d="M2 10h6" />
				<path d="M16 10h6" />
			</svg>
		),
	},
	{
		id: "otp",
		label: "otp codes",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
				<circle cx="12" cy="12" r="10" />
				<polyline points="12 6 12 12 16 14" />
			</svg>
		),
	},
	{
		id: "passkey",
		label: "passkeys",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
				<path d="M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
				<path d="M12 14v8" />
				<path d="M9 18h6" />
			</svg>
		),
	},
];

export function Sidebar({ items, category, onCategory, user, onLogout, onNavigate }: Props) {
	function count(id: Category): number {
		if (id === "all") return items.filter((i) => !i.deleted).length;
		if (id === "favorites") return items.filter((i) => !i.deleted && i.favorite).length;
		return items.filter((i) => !i.deleted && i.type === id).length;
	}

	return (
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
				<div className="nav-section">
					{categories.slice(0, 2).map((cat) => (
						<button
							key={cat.id}
							type="button"
							className={`nav-item ${category === cat.id ? "active" : ""}`}
							onClick={() => onCategory(cat.id)}
						>
							{cat.icon}
							<span>{cat.label}</span>
							<span className="nav-count">{count(cat.id)}</span>
						</button>
					))}
				</div>

				<div className="nav-divider" />

				<div className="nav-section">
					<div className="nav-section-title">types</div>
					{categories.slice(2).map((cat) => (
						<button
							key={cat.id}
							type="button"
							className={`nav-item ${category === cat.id ? "active" : ""}`}
							onClick={() => onCategory(cat.id)}
						>
							{cat.icon}
							<span>{cat.label}</span>
							<span className="nav-count">{count(cat.id)}</span>
						</button>
					))}
				</div>

				<div className="nav-divider" />

				<div className="nav-section">
					<div className="nav-section-title">tools</div>
					<button
						type="button"
						className="nav-item"
						onClick={() => onNavigate("generator")}
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
							<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
						</svg>
						<span>generator</span>
					</button>
				</div>
			</nav>

			<div className="sidebar-footer">
				<div className="user-info">
					<div className="user-avatar">{user.email.charAt(0).toUpperCase()}</div>
					<span className="user-email">{user.email}</span>
				</div>
				<button type="button" className="logout-btn" onClick={onLogout}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
						<polyline points="16 17 21 12 16 7" />
						<line x1="21" y1="12" x2="9" y2="12" />
					</svg>
				</button>
			</div>

			<style>{`
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
					overflow-y: auto;
				}
				.nav-section {
					display: flex;
					flex-direction: column;
					gap: 0.125rem;
				}
				.nav-section-title {
					font-size: 0.6875rem;
					font-weight: 600;
					color: var(--fg-subtle);
					text-transform: uppercase;
					letter-spacing: 0.05em;
					padding: 0.5rem 0.75rem;
					margin-bottom: 0.25rem;
				}
				.nav-divider {
					height: 1px;
					background: var(--border);
					margin: 0.75rem 0;
				}
				.nav-item {
					display: flex;
					align-items: center;
					gap: 0.75rem;
					padding: 0.5rem 0.75rem;
					border-radius: var(--radius-sm);
					color: var(--fg-muted);
					text-decoration: none;
					transition: var(--transition);
					background: none;
					border: none;
					width: 100%;
					text-align: left;
					cursor: pointer;
					font-size: 0.8125rem;
					font-weight: 500;
				}
				.nav-item svg {
					width: 1rem;
					height: 1rem;
					flex-shrink: 0;
				}
				.nav-item span:first-of-type {
					flex: 1;
				}
				.nav-count {
					font-size: 0.6875rem;
					color: var(--fg-subtle);
					min-width: 20px;
					text-align: right;
				}
				.nav-item:hover {
					color: var(--fg);
					background: var(--bg-subtle);
				}
				.nav-item.active {
					color: var(--fg);
					background: var(--bg-elevated);
				}
				.nav-item.active .nav-count {
					color: var(--accent);
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
				.logout-btn {
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
				.logout-btn svg {
					width: 1rem;
					height: 1rem;
				}
				.logout-btn:hover {
					color: #ef4444;
					background: rgba(239, 68, 68, 0.1);
				}
			`}</style>
		</aside>
	);
}

export type { Category };
