import { useEffect, useState } from "react";
import { getSession, logout, type Session } from "./auth";
import { Login } from "./pages/login";
import { Vault } from "./pages/vault";
import { Generator } from "./pages/generator";

type View = "login" | "vault" | "generator";

export function App() {
	const [view, setView] = useState<View>("login");
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getSession()
			.then((s) => {
				if (s) {
					setSession(s);
					setView("vault");
				}
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	function handleLogin(s: Session) {
		setSession(s);
		setView("vault");
	}

	async function handleLogout() {
		await logout();
		setSession(null);
		setView("login");
	}

	function navigate(to: View) {
		setView(to);
	}

	if (loading) {
		return (
			<div className="loading">
				<style>{`
					.loading {
						min-height: 100vh;
						display: flex;
						align-items: center;
						justify-content: center;
						color: var(--muted);
					}
				`}</style>
			</div>
		);
	}

	if (view === "login") {
		return <Login onLogin={handleLogin} />;
	}

	if (view === "generator") {
		return (
			<Generator
				onBack={() => navigate("vault")}
				user={{ email: session!.email }}
				onLogout={handleLogout}
			/>
		);
	}

	return (
		<Vault
			user={{ email: session!.email }}
			token={session!.token}
			onLogout={handleLogout}
			onNavigate={navigate}
		/>
	);
}
