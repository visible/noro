export type Mode = "random" | "diceware" | "pin";

export function strength(password: string, mode: Mode): { label: string; percent: number } {
	if (!password) return { label: "none", percent: 0 };

	if (mode === "pin") {
		if (password.length >= 8) return { label: "strong", percent: 100 };
		if (password.length >= 6) return { label: "good", percent: 66 };
		return { label: "weak", percent: 33 };
	}

	if (mode === "diceware") {
		const words = password.split("-").length;
		if (words >= 6) return { label: "strong", percent: 100 };
		if (words >= 4) return { label: "good", percent: 66 };
		return { label: "weak", percent: 33 };
	}

	let score = 0;
	if (password.length >= 16) score++;
	if (password.length >= 24) score++;
	if (/[A-Z]/.test(password)) score++;
	if (/[a-z]/.test(password)) score++;
	if (/[0-9]/.test(password)) score++;
	if (/[^A-Za-z0-9]/.test(password)) score++;

	if (score >= 5) return { label: "strong", percent: 100 };
	if (score >= 3) return { label: "good", percent: 66 };
	return { label: "weak", percent: 33 };
}
