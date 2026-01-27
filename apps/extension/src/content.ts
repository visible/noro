import { createpopup, createicon } from "./autofill";

interface Credential {
	id: string;
	site: string;
	username: string;
	password: string;
	created: number;
}

interface LoginForm {
	form: HTMLFormElement | null;
	username: HTMLInputElement;
	password: HTMLInputElement;
}

let currentform: LoginForm | null = null;

function findloginforms(): LoginForm[] {
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

function getsite(): string {
	return window.location.hostname.replace(/^www\./, "");
}

async function getcredentials(): Promise<Credential[]> {
	return new Promise((resolve) => {
		chrome.runtime.sendMessage({ type: "credentials", site: getsite() }, (response) => {
			resolve(response || []);
		});
	});
}

function fill(cred: Credential): void {
	if (!currentform) return;

	const { username, password } = currentform;

	setvalue(username, cred.username);
	setvalue(password, cred.password);
}

function setvalue(input: HTMLInputElement, value: string): void {
	input.focus();
	input.value = value;
	input.dispatchEvent(new Event("input", { bubbles: true }));
	input.dispatchEvent(new Event("change", { bubbles: true }));
}

function enablesaveonsubmit(): void {
	if (!currentform) return;

	const { form, username, password } = currentform;

	const save = () => {
		const user = username.value.trim();
		const pass = password.value;

		if (user && pass) {
			chrome.runtime.sendMessage({
				type: "savecredential",
				site: getsite(),
				username: user,
				password: pass,
			});
		}
	};

	if (form) {
		form.addEventListener("submit", save, { once: true });
	}

	const buttons = document.querySelectorAll<HTMLButtonElement>(
		'button[type="submit"], input[type="submit"], button:not([type])'
	);
	for (const button of buttons) {
		button.addEventListener("click", () => setTimeout(save, 100), { once: true });
	}
}

function addicons(): void {
	const forms = findloginforms();

	for (const loginform of forms) {
		if (loginform.username.dataset.noroicon) continue;

		loginform.username.dataset.noroicon = "true";
		loginform.password.dataset.noroicon = "true";

		const wrapper = loginform.username.parentElement;
		if (wrapper) {
			const computed = getComputedStyle(wrapper);
			if (computed.position === "static") {
				wrapper.style.position = "relative";
			}

			const icon = createicon(async () => {
				currentform = loginform;
				const credentials = await getcredentials();
				createpopup(credentials, loginform.username, fill, enablesaveonsubmit);
			});

			wrapper.appendChild(icon);
		}
	}
}

function init(): void {
	addicons();

	const observer = new MutationObserver(() => {
		addicons();
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
