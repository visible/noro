import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Props {
	user: { email: string };
	onLogout: () => void;
	onBack: () => void;
}

interface Options {
	length: number;
	uppercase: boolean;
	lowercase: boolean;
	numbers: boolean;
	symbols: boolean;
}

interface Result {
	password: string;
	strength: string;
}

const colors: Record<string, string> = {
	weak: "#ef4444",
	fair: "#f59e0b",
	good: "#eab308",
	strong: "#22c55e",
	excellent: "#10b981",
};

export function Generator({ user, onLogout, onBack }: Props) {
	const [password, setPassword] = useState("");
	const [strength, setStrength] = useState("");
	const [copied, setCopied] = useState(false);
	const [options, setOptions] = useState<Options>({
		length: 20,
		uppercase: true,
		lowercase: true,
		numbers: true,
		symbols: true,
	});

	async function generate() {
		try {
			const result = await invoke<Result>("generate_password", { options });
			setPassword(result.password);
			setStrength(result.strength);
			setCopied(false);
		} catch (err) {
			console.error(err);
		}
	}

	async function copy() {
		await navigator.clipboard.writeText(password);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	function toggle(key: keyof Omit<Options, "length">) {
		setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
	}

	return (
		<div className="layout">
			<aside className="sidebar">
				<div className="sidebar-logo">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						aria-hidden="true"
					>
						<path d="M12 2L2 7l10 5 10-5-10-5z" />
						<path d="M2 17l10 5 10-5" />
						<path d="M2 12l10 5 10-5" />
					</svg>
					<span>noro</span>
				</div>

				<nav className="sidebar-nav">
					<button type="button" className="nav-item" onClick={onBack}>
						<span>vault</span>
					</button>
					<button type="button" className="nav-item active">
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
				<h1>password generator</h1>

				<div className="output">
					<input
						type="text"
						value={password}
						readOnly
						placeholder="click generate"
						className="mono"
					/>
					{password && (
						<button onClick={copy} className="copy" type="button">
							{copied ? "copied" : "copy"}
						</button>
					)}
				</div>

				{strength && (
					<div className="strength">
						<span>strength:</span>
						<span style={{ color: colors[strength] }}>{strength}</span>
					</div>
				)}

				<div className="options">
					<div className="option">
						<label>length: {options.length}</label>
						<input
							type="range"
							min={4}
							max={128}
							value={options.length}
							onChange={(e) =>
								setOptions((prev) => ({
									...prev,
									length: Number(e.target.value),
								}))
							}
						/>
					</div>

					<div className="toggles">
						<label className="toggle">
							<input
								type="checkbox"
								checked={options.uppercase}
								onChange={() => toggle("uppercase")}
							/>
							<span>uppercase (A-Z)</span>
						</label>

						<label className="toggle">
							<input
								type="checkbox"
								checked={options.lowercase}
								onChange={() => toggle("lowercase")}
							/>
							<span>lowercase (a-z)</span>
						</label>

						<label className="toggle">
							<input
								type="checkbox"
								checked={options.numbers}
								onChange={() => toggle("numbers")}
							/>
							<span>numbers (0-9)</span>
						</label>

						<label className="toggle">
							<input
								type="checkbox"
								checked={options.symbols}
								onChange={() => toggle("symbols")}
							/>
							<span>symbols (!@#$)</span>
						</label>
					</div>
				</div>

				<button onClick={generate} className="primary" type="button">
					generate
				</button>
			</main>

			<style>{`
				.layout {
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
					padding: 2rem;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					gap: 1.5rem;
				}
				.content h1 {
					font-size: 1.5rem;
					font-weight: 600;
					margin-bottom: 1rem;
				}
				.output {
					width: 100%;
					max-width: 400px;
					display: flex;
					gap: 0.5rem;
				}
				.output input {
					flex: 1;
					padding: 0.75rem 1rem;
					background: rgba(255, 255, 255, 0.05);
					border: 1px solid var(--border);
					border-radius: 0.5rem;
					color: var(--fg);
					font-size: 0.875rem;
				}
				.output input.mono {
					font-family: ui-monospace, monospace;
				}
				.copy {
					padding: 0.75rem 1rem;
					background: rgba(255, 255, 255, 0.1);
					border: 1px solid var(--border);
					border-radius: 0.5rem;
					color: var(--fg);
					cursor: pointer;
					font-size: 0.875rem;
				}
				.copy:hover {
					background: rgba(255, 255, 255, 0.15);
				}
				.strength {
					display: flex;
					gap: 0.5rem;
					font-size: 0.875rem;
				}
				.strength span:first-child {
					color: var(--muted);
				}
				.options {
					width: 100%;
					max-width: 400px;
					display: flex;
					flex-direction: column;
					gap: 1rem;
				}
				.option {
					display: flex;
					flex-direction: column;
					gap: 0.5rem;
				}
				.option label {
					font-size: 0.875rem;
					color: var(--muted);
				}
				.option input[type="range"] {
					width: 100%;
					accent-color: var(--accent);
				}
				.toggles {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 0.75rem;
				}
				.toggle {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					font-size: 0.875rem;
					cursor: pointer;
				}
				.toggle input[type="checkbox"] {
					accent-color: var(--accent);
				}
				button.primary {
					width: 100%;
					max-width: 400px;
					padding: 0.75rem;
					background: var(--accent);
					color: black;
					border: none;
					border-radius: 0.5rem;
					font-weight: 600;
					cursor: pointer;
					font-size: 1rem;
				}
				button.primary:hover {
					opacity: 0.9;
				}
			`}</style>
		</div>
	);
}
