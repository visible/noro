import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Titlebar } from "../app";

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

const strengthColors: Record<string, string> = {
	weak: "#ef4444",
	fair: "#f59e0b",
	good: "#eab308",
	strong: "#22c55e",
	excellent: "#10b981",
};

const strengthLabels: Record<string, string> = {
	weak: "weak",
	fair: "fair",
	good: "good",
	strong: "strong",
	excellent: "excellent",
};

const navitems = [
	{
		id: "vault",
		label: "vault",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
				<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
			</svg>
		),
	},
	{
		id: "generator",
		label: "generator",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
				<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
			</svg>
		),
	},
	{
		id: "settings",
		label: "settings",
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
				<circle cx="12" cy="12" r="3" />
				<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
			</svg>
		),
	},
];

export function Generator({ user, onLogout, onBack }: Props) {
	const [password, setPassword] = useState("");
	const [strength, setStrength] = useState("");
	const [copied, setCopied] = useState(false);
	const [activeNav, setActiveNav] = useState("generator");
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
		} catch {}
	}

	async function copy() {
		await navigator.clipboard.writeText(password);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	function toggle(key: keyof Omit<Options, "length">) {
		setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
	}

	function handleNavClick(id: string) {
		setActiveNav(id);
		if (id === "vault") {
			onBack();
		}
	}

	return (
		<div className="app-container">
			<Titlebar showLogo={false} />
			<div className="generator-layout">
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
						{navitems.map((item) => (
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
								aria-hidden="true"
							>
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
								<polyline points="16 17 21 12 16 7" />
								<line x1="21" y1="12" x2="9" y2="12" />
							</svg>
						</button>
					</div>
				</aside>

				<main className="content">
					<div className="generator-card">
						<div className="generator-header">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								aria-hidden="true"
							>
								<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
							</svg>
							<h1>password generator</h1>
						</div>

						<div className="output-section">
							<div className="output-field">
								<input
									type="text"
									value={password}
									readOnly
									placeholder="click generate to create a password"
									className="password-input"
								/>
								{password && (
									<button onClick={copy} className="copy-btn" type="button">
										{copied ? (
											<svg
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												aria-hidden="true"
											>
												<polyline points="20 6 9 17 4 12" />
											</svg>
										) : (
											<svg
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												aria-hidden="true"
											>
												<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
												<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
											</svg>
										)}
									</button>
								)}
							</div>

							{strength && (
								<div className="strength-indicator">
									<div className="strength-bar">
										<div
											className="strength-fill"
											style={{
												width: `${
													strength === "weak"
														? 20
														: strength === "fair"
															? 40
															: strength === "good"
																? 60
																: strength === "strong"
																	? 80
																	: 100
												}%`,
												background: strengthColors[strength],
											}}
										/>
									</div>
									<span
										className="strength-label"
										style={{ color: strengthColors[strength] }}
									>
										{strengthLabels[strength]}
									</span>
								</div>
							)}
						</div>

						<div className="options-section">
							<div className="option-row">
								<div className="option-label">
									<span>length</span>
									<span className="length-value">{options.length}</span>
								</div>
								<input
									type="range"
									min={8}
									max={128}
									value={options.length}
									onChange={(e) =>
										setOptions((prev) => ({
											...prev,
											length: Number(e.target.value),
										}))
									}
									className="range-slider"
								/>
							</div>

							<div className="toggles-grid">
								<label className="toggle-option">
									<input
										type="checkbox"
										checked={options.uppercase}
										onChange={() => toggle("uppercase")}
									/>
									<span className="toggle-switch" />
									<span className="toggle-label">uppercase (A-Z)</span>
								</label>

								<label className="toggle-option">
									<input
										type="checkbox"
										checked={options.lowercase}
										onChange={() => toggle("lowercase")}
									/>
									<span className="toggle-switch" />
									<span className="toggle-label">lowercase (a-z)</span>
								</label>

								<label className="toggle-option">
									<input
										type="checkbox"
										checked={options.numbers}
										onChange={() => toggle("numbers")}
									/>
									<span className="toggle-switch" />
									<span className="toggle-label">numbers (0-9)</span>
								</label>

								<label className="toggle-option">
									<input
										type="checkbox"
										checked={options.symbols}
										onChange={() => toggle("symbols")}
									/>
									<span className="toggle-switch" />
									<span className="toggle-label">symbols (!@#$)</span>
								</label>
							</div>
						</div>

						<button onClick={generate} className="generate-btn" type="button">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								aria-hidden="true"
							>
								<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
							</svg>
							generate password
						</button>
					</div>
				</main>
			</div>

			<style>{`
				.generator-layout {
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
					align-items: center;
					justify-content: center;
					padding: 2rem;
					background: var(--bg);
				}
				.generator-card {
					width: 100%;
					max-width: 480px;
					background: var(--bg-elevated);
					border: 1px solid var(--border);
					border-radius: var(--radius-lg);
					padding: 2rem;
				}
				.generator-header {
					display: flex;
					align-items: center;
					gap: 0.75rem;
					margin-bottom: 2rem;
				}
				.generator-header svg {
					width: 1.5rem;
					height: 1.5rem;
					color: var(--accent);
				}
				.generator-header h1 {
					font-size: 1.25rem;
					font-weight: 600;
					letter-spacing: -0.01em;
				}
				.output-section {
					margin-bottom: 1.5rem;
				}
				.output-field {
					display: flex;
					gap: 0.5rem;
					margin-bottom: 0.75rem;
				}
				.password-input {
					flex: 1;
					padding: 0.875rem 1rem;
					background: var(--bg);
					border: 1px solid var(--border);
					border-radius: var(--radius-sm);
					color: var(--fg);
					font-family: ui-monospace, "SF Mono", monospace;
					font-size: 0.875rem;
					letter-spacing: 0.02em;
				}
				.password-input:focus {
					outline: none;
					border-color: var(--accent);
				}
				.password-input::placeholder {
					color: var(--fg-subtle);
					font-family: inherit;
				}
				.copy-btn {
					width: 44px;
					height: 44px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: var(--bg);
					border: 1px solid var(--border);
					border-radius: var(--radius-sm);
					color: var(--fg-muted);
					cursor: pointer;
					transition: var(--transition);
					flex-shrink: 0;
				}
				.copy-btn:hover {
					color: var(--accent);
					border-color: var(--accent);
				}
				.copy-btn svg {
					width: 1.125rem;
					height: 1.125rem;
				}
				.strength-indicator {
					display: flex;
					align-items: center;
					gap: 0.75rem;
				}
				.strength-bar {
					flex: 1;
					height: 4px;
					background: var(--bg);
					border-radius: 2px;
					overflow: hidden;
				}
				.strength-fill {
					height: 100%;
					border-radius: 2px;
					transition: width 0.3s ease, background 0.3s ease;
				}
				.strength-label {
					font-size: 0.75rem;
					font-weight: 600;
					text-transform: uppercase;
					letter-spacing: 0.05em;
				}
				.options-section {
					margin-bottom: 1.5rem;
				}
				.option-row {
					margin-bottom: 1.25rem;
				}
				.option-label {
					display: flex;
					justify-content: space-between;
					margin-bottom: 0.5rem;
					font-size: 0.8125rem;
					color: var(--fg-muted);
				}
				.length-value {
					color: var(--fg);
					font-weight: 600;
					font-variant-numeric: tabular-nums;
				}
				.range-slider {
					width: 100%;
					height: 4px;
					background: var(--bg);
					border-radius: 2px;
					appearance: none;
					cursor: pointer;
				}
				.range-slider::-webkit-slider-thumb {
					appearance: none;
					width: 16px;
					height: 16px;
					background: var(--accent);
					border-radius: 50%;
					cursor: pointer;
					transition: transform 0.15s;
				}
				.range-slider::-webkit-slider-thumb:hover {
					transform: scale(1.1);
				}
				.toggles-grid {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 0.75rem;
				}
				.toggle-option {
					display: flex;
					align-items: center;
					gap: 0.625rem;
					cursor: pointer;
				}
				.toggle-option input {
					position: absolute;
					opacity: 0;
					width: 0;
					height: 0;
				}
				.toggle-switch {
					width: 36px;
					height: 20px;
					background: var(--bg);
					border-radius: 10px;
					position: relative;
					transition: var(--transition);
					flex-shrink: 0;
				}
				.toggle-switch::after {
					content: "";
					position: absolute;
					width: 16px;
					height: 16px;
					background: var(--fg-subtle);
					border-radius: 50%;
					top: 2px;
					left: 2px;
					transition: var(--transition);
				}
				.toggle-option input:checked + .toggle-switch {
					background: rgba(212, 176, 140, 0.2);
				}
				.toggle-option input:checked + .toggle-switch::after {
					transform: translateX(16px);
					background: var(--accent);
				}
				.toggle-label {
					font-size: 0.8125rem;
					color: var(--fg-muted);
				}
				.generate-btn {
					width: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 0.5rem;
					padding: 0.875rem;
					background: var(--accent);
					color: var(--bg);
					border: none;
					border-radius: var(--radius-sm);
					font-weight: 600;
					font-size: 0.875rem;
					cursor: pointer;
					transition: var(--transition);
				}
				.generate-btn:hover {
					background: var(--accent-hover);
				}
				.generate-btn svg {
					width: 1rem;
					height: 1rem;
				}
			`}</style>
		</div>
	);
}
