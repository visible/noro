export type BreachResult = {
	breached: boolean;
	count: number;
};

export type EmailBreach = {
	name: string;
	title: string;
	domain: string;
	date: string;
	count: number;
	description: string;
	types: string[];
};

export type EmailBreachResult = {
	breached: boolean;
	breaches: EmailBreach[];
};

async function sha1(text: string): Promise<string> {
	const data = new TextEncoder().encode(text);
	const buffer = await crypto.subtle.digest("SHA-1", data);
	const array = Array.from(new Uint8Array(buffer));
	return array.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export async function checkpassword(password: string): Promise<BreachResult> {
	const hash = await sha1(password);
	const prefix = hash.slice(0, 5);
	const suffix = hash.slice(5);

	const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
		headers: { "Add-Padding": "true" },
	});

	if (!res.ok) {
		throw new Error("hibp api error");
	}

	const text = await res.text();
	const lines = text.split("\n");

	for (const line of lines) {
		const [hashsuffix, countstr] = line.split(":");
		if (hashsuffix.trim() === suffix) {
			const count = parseInt(countstr.trim(), 10);
			if (count > 0) {
				return { breached: true, count };
			}
		}
	}

	return { breached: false, count: 0 };
}

export async function checkemail(email: string, apikey: string): Promise<EmailBreachResult> {
	const res = await fetch(
		`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
		{
			headers: {
				"hibp-api-key": apikey,
				"User-Agent": "noro-breach-checker",
			},
		}
	);

	if (res.status === 404) {
		return { breached: false, breaches: [] };
	}

	if (!res.ok) {
		throw new Error("hibp api error");
	}

	const data = await res.json();

	const breaches: EmailBreach[] = data.map((b: Record<string, unknown>) => ({
		name: b.Name,
		title: b.Title,
		domain: b.Domain,
		date: b.BreachDate,
		count: b.PwnCount,
		description: b.Description,
		types: b.DataClasses,
	}));

	return { breached: breaches.length > 0, breaches };
}
