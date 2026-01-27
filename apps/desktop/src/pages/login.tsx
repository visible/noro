import { useState } from "react";

interface Props {
	onLogin: (email: string) => void;
}

export function Login({ onLogin }: Props) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [secretKey, setSecretKey] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await new Promise((r) => setTimeout(r, 500));
			onLogin(email);
		} catch {
			setError("login failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="login">
			<div className="login-logo">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M12 2L2 7l10 5 10-5-10-5z" />
					<path d="M2 17l10 5 10-5" />
					<path d="M2 12l10 5 10-5" />
				</svg>
				<span>noro</span>
			</div>

			<form onSubmit={handleSubmit} className="login-form">
				<div className="field">
					<label>email</label>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>

				<div className="field">
					<label>password</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>

				<div className="field">
					<label>secret key</label>
					<input
						type="text"
						value={secretKey}
						onChange={(e) => setSecretKey(e.target.value)}
						placeholder="A3-XXXXXX-XXXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
						className="mono"
						required
					/>
				</div>

				{error && <p className="error">{error}</p>}

				<button type="submit" disabled={loading} className="primary">
					{loading ? "signing in..." : "sign in"}
				</button>
			</form>

			<style>{`
				.login {
					min-height: 100vh;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					padding: 2rem;
				}
				.login-logo {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					margin-bottom: 3rem;
					font-size: 1.5rem;
					font-weight: bold;
				}
				.login-logo svg {
					width: 2rem;
					height: 2rem;
					color: var(--accent);
				}
				.login-form {
					width: 100%;
					max-width: 320px;
					display: flex;
					flex-direction: column;
					gap: 1rem;
				}
				.field {
					display: flex;
					flex-direction: column;
					gap: 0.5rem;
				}
				.field label {
					font-size: 0.875rem;
					color: var(--muted);
				}
				.field input {
					padding: 0.75rem 1rem;
					background: rgba(255, 255, 255, 0.05);
					border: 1px solid var(--border);
					border-radius: 0.5rem;
					color: var(--fg);
					font-size: 1rem;
				}
				.field input:focus {
					outline: none;
					border-color: var(--accent);
				}
				.field input.mono {
					font-family: ui-monospace, monospace;
					font-size: 0.75rem;
				}
				.error {
					color: #ef4444;
					font-size: 0.875rem;
				}
				button.primary {
					padding: 0.75rem;
					background: var(--accent);
					color: black;
					border: none;
					border-radius: 0.5rem;
					font-weight: 600;
					cursor: pointer;
				}
				button.primary:hover {
					opacity: 0.9;
				}
				button.primary:disabled {
					opacity: 0.5;
				}
			`}</style>
		</div>
	);
}
