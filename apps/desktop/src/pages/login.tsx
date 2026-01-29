import { useState } from "react";
import { login, register, type Session } from "../auth";
import { Titlebar } from "../app";

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
		<div className="app-container">
			<Titlebar showLogo={false} />
			<div className="login">
				<div className="login-card">
					<div className="login-logo">
						<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path
								fill="var(--accent)"
								d="M17.5,3.875 C19.7782,3.875 21.625,5.72183 21.625,8 C21.625,9.2471 21.0714,10.36501 20.1971,11.12122 C20.4748,11.86972 20.625,12.66939 20.625,13.5 C20.625,15.89 19.382,18.0188 17.4446,19.4143 C17.1624,19.6176 16.8653,19.8054 16.5551,19.9763 L16.5183,19.9964 C15.2037,20.7125 13.6559,21.125 12,21.125 C10.34411,21.125 8.79628,20.7124 7.48166,19.9964 C7.1745,19.8291 6.88004,19.6452 6.59991,19.4462 L6.55539,19.4143 C4.61803,18.0188 3.375,15.89 3.375,13.5 C3.375,12.66939 3.52525,11.86971 3.80294,11.12122 C2.92856,10.36501 2.375,9.2471 2.375,8 C2.375,5.72183 4.22183,3.875 6.5,3.875 C8.07432,3.875 9.44244,4.75696 10.1376,6.05321 C10.73749,5.9365 11.36069,5.875 12,5.875 C12.6393,5.875 13.2625,5.9365 13.8624,6.05321 C14.5576,4.75696 15.9257,3.875 17.5,3.875 Z M13.5225,16.3968 C13.4126,16.6012 13.2228,16.7712 12.99,16.8943 C12.7145,17.04 12.3705,17.125 12,17.125 C11.62961,17.125 11.28562,17.0401 11.01014,16.8944 C10.77744,16.7713 10.58761,16.6014 10.47768,16.3971 C9.33578,16.8209 8.41869,17.7081 7.95497,18.8301 C9.1128,19.4892 10.50081,19.875 12,19.875 C13.4993,19.875 14.8874,19.4892 16.0453,18.8299 C15.7958,18.2257 15.4115,17.6816 14.9154,17.2378 C14.5045,16.8703 14.0326,16.586 13.5225,16.3968 Z M12,7.125 C7.88428,7.125 4.625,10.02458 4.625,13.5 C4.625,15.2987 5.49533,16.9402 6.9074,18.1082 C7.80618,16.1978 9.74847,14.875 12,14.875 C13.4399,14.875 14.7538,15.4162 15.7487,16.3061 C16.3092,16.8075 16.7686,17.4196 17.0926,18.1082 C18.5047,16.9402 19.375,15.2987 19.375,13.5 C19.375,10.02458 16.1157,7.125 12,7.125 Z M6.5,5.125 C4.91218,5.125 3.625,6.41218 3.625,8 C3.625,8.73272 3.90091,9.41662 4.37336,9.93541 C5.34066,8.32097 6.94287,7.05326 8.88195,6.38844 C8.35812,5.61513 7.47532,5.125 6.5,5.125 Z M17.5,5.125 C16.5254,5.125 15.6424,5.6143 15.1181,6.38845 C17.0571,7.05327 18.6593,8.32095 19.6266,9.93534 C20.1002,9.41558 20.375,8.73173 20.375,8 C20.375,6.41218 19.0878,5.125 17.5,5.125 Z"
							/>
						</svg>
						<span>noro</span>
					</div>

					<p className="login-subtitle">
						{isLogin ? "welcome back" : "create your account"}
					</p>

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
								autoFocus
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
				</div>

				<style>{`
					.login {
						flex: 1;
						display: flex;
						align-items: center;
						justify-content: center;
						padding: 2rem;
						background: var(--bg);
					}
					.login-card {
						width: 100%;
						max-width: 360px;
						padding: 2.5rem;
						background: var(--bg-elevated);
						border: 1px solid var(--border);
						border-radius: var(--radius-lg);
					}
					.login-logo {
						display: flex;
						align-items: center;
						justify-content: center;
						gap: 0.75rem;
						margin-bottom: 0.75rem;
						font-size: 1.75rem;
						font-weight: 600;
						letter-spacing: -0.02em;
					}
					.login-logo svg {
						width: 2.5rem;
						height: 2.5rem;
					}
					.login-subtitle {
						text-align: center;
						color: var(--fg-muted);
						font-size: 0.875rem;
						margin-bottom: 2rem;
					}
					.login-form {
						display: flex;
						flex-direction: column;
						gap: 1.25rem;
					}
					.field {
						display: flex;
						flex-direction: column;
						gap: 0.5rem;
					}
					.field label {
						font-size: 0.8125rem;
						font-weight: 500;
						color: var(--fg-muted);
					}
					.field input {
						padding: 0.875rem 1rem;
						background: var(--bg);
						border: 1px solid var(--border);
						border-radius: var(--radius-sm);
						color: var(--fg);
						font-size: 0.9375rem;
						transition: var(--transition);
					}
					.field input:focus {
						outline: none;
						border-color: var(--accent);
						box-shadow: 0 0 0 3px rgba(212, 176, 140, 0.1);
					}
					.field input::placeholder {
						color: var(--fg-subtle);
					}
					.hint {
						font-size: 0.75rem;
						color: var(--fg-subtle);
					}
					.error {
						color: #ef4444;
						font-size: 0.8125rem;
						padding: 0.75rem 1rem;
						background: rgba(239, 68, 68, 0.1);
						border-radius: var(--radius-sm);
						border: 1px solid rgba(239, 68, 68, 0.2);
					}
					button.primary {
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
					button.primary:hover {
						background: var(--accent-hover);
					}
					button.primary:disabled {
						opacity: 0.5;
						cursor: not-allowed;
					}
					.switch {
						font-size: 0.8125rem;
						color: var(--fg-muted);
						text-align: center;
					}
					.switch button {
						background: none;
						border: none;
						color: var(--accent);
						cursor: pointer;
						padding: 0;
						font-size: inherit;
						font-weight: 500;
					}
					.switch button:hover {
						text-decoration: underline;
					}
				`}</style>
			</div>
		</div>
	);
}
