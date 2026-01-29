export interface LoginForm {
	form: HTMLFormElement | null;
	username: HTMLInputElement;
	password: HTMLInputElement;
}

export function findloginforms(): LoginForm[] {
	const forms: LoginForm[] = [];
	const passwords = document.querySelectorAll<HTMLInputElement>('input[type="password"]');

	for (const password of passwords) {
		if (!password.offsetParent) continue;

		const form = password.closest("form");
		const container = form || password.parentElement;
		if (!container) continue;

		const inputs = container.querySelectorAll<HTMLInputElement>("input");
		let username: HTMLInputElement | null = null;

		for (const input of inputs) {
			if (input === password) continue;
			if (input.type === "hidden" || input.type === "submit") continue;

			const type = input.type.toLowerCase();
			const name = (input.name || "").toLowerCase();
			const id = (input.id || "").toLowerCase();
			const autocomplete = (input.autocomplete || "").toLowerCase();

			if (
				type === "email" ||
				type === "text" ||
				name.includes("user") ||
				name.includes("email") ||
				name.includes("login") ||
				id.includes("user") ||
				id.includes("email") ||
				id.includes("login") ||
				autocomplete === "username" ||
				autocomplete === "email"
			) {
				username = input;
				break;
			}
		}

		if (username) {
			forms.push({ form, username, password });
		}
	}

	return forms;
}

export function getsite(): string {
	return window.location.hostname.replace(/^www\./, "");
}

export function setvalue(input: HTMLInputElement, value: string): void {
	input.focus();
	input.value = value;
	input.dispatchEvent(new Event("input", { bubbles: true }));
	input.dispatchEvent(new Event("change", { bubbles: true }));
}

export function observeforms(callback: () => void): MutationObserver {
	const observer = new MutationObserver(() => {
		callback();
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});

	return observer;
}
