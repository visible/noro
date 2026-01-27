import { useState } from "react";
import { login, register, type Session } from "../auth";

interface Props {
	onLogin: (session: Session) => void;
}

type Mode = "login" | "register";

export function Login({ onLogin }: Props) {
	const [mode, setMode] = useState<Mode>("login");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			if (mode === "login") {
				const session = await login(email, password);
				onLogin(session);
			} else {
				const session = await register(email, password, name || undefined);
				onLogin(session);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
		}
	}

	const isLogin = mode === "login";

	return (
		<div className="login">
			<div className="login-logo">
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

			<form onSubmit={handleSubmit} className="login-form">
				{!isLogin && (
					<div className="field">
						<label htmlFor="name">name</label>
						<input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="optional"
						/>
					</div>
				)}

				<div className="field">
					<label htmlFor="email">email</label>
					<input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>

				<div className="field">
					<label htmlFor="password">password</label>
					<input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						minLength={isLogin ? undefined : 12}
					/>
					{!isLogin && <p className="hint">minimum 12 characters</p>}
				</div>

				{error && <p className="error">{error}</p>}

				<button type="submit" disabled={loading} className="primary">
					{loading
						? isLogin
							? "signing in..."
							: "creating account..."
						: isLogin
							? "sign in"
							: "create account"}
				</button>

				<p className="switch">
					{isLogin ? (
						<>
							don&apos;t have an account?{" "}
							<button type="button" onClick={() => setMode("register")}>
								create one
							</button>
						</>
					) : (
						<>
							already have an account?{" "}
							<button type="button" onClick={() => setMode("login")}>
								sign in
							</button>
						</>
					)}
				</p>
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
				.hint {
					font-size: 0.75rem;
					color: var(--muted);
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
				.switch {
					font-size: 0.875rem;
					color: var(--muted);
					text-align: center;
				}
				.switch button {
					background: none;
					border: none;
					color: var(--accent);
					cursor: pointer;
					padding: 0;
					font-size: inherit;
				}
				.switch button:hover {
					text-decoration: underline;
				}
			`}</style>
		</div>
	);
}
