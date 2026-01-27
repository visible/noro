import { useState } from "react";
import { Login } from "./pages/login";
import { Vault } from "./pages/vault";

type View = "login" | "vault";

export function App() {
	const [view, setView] = useState<View>("login");
	const [user, setUser] = useState<{ email: string } | null>(null);

	function handleLogin(email: string) {
		setUser({ email });
		setView("vault");
	}

	function handleLogout() {
		setUser(null);
		setView("login");
	}

	if (view === "login") {
		return <Login onLogin={handleLogin} />;
	}

	return <Vault user={user!} onLogout={handleLogout} />;
}
