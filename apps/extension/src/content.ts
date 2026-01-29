import { createpopup, createicon, fill, fillpassword } from "./autofill";
import { findloginforms, getsite, observeforms } from "./detector";
import type { LoginForm } from "./detector";
import type { VaultItem } from "./vault";

interface Credential {
	id: string;
	site: string;
	username: string;
	password: string;
	created: number;
}

type CredentialOrVaultItem = Credential | VaultItem;

let currentform: LoginForm | null = null;

async function getcredentials(): Promise<Credential[]> {
	return new Promise((resolve) => {
		chrome.runtime.sendMessage({ type: "credentials", site: getsite() }, (response) => {
			resolve(response || []);
		});
	});
}

async function getvaultitems(): Promise<VaultItem[]> {
	return new Promise((resolve) => {
		chrome.runtime.sendMessage({ type: "vaultmatch", url: window.location.href }, (response) => {
			resolve(response || []);
		});
	});
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

function handleselect(cred: CredentialOrVaultItem): void {
	if (!currentform) return;
	fill(currentform, cred);
}

function handlegenerate(password: string): void {
	if (!currentform) return;
	fillpassword(currentform, password);
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
				const [credentials, vaultitems] = await Promise.all([
					getcredentials(),
					getvaultitems(),
				]);
				const combined: CredentialOrVaultItem[] = [...vaultitems, ...credentials];
				createpopup(combined, loginform.username, handleselect, enablesaveonsubmit, handlegenerate);
			});

			wrapper.appendChild(icon);
		}
	}
}

function init(): void {
	addicons();
	observeforms(addicons);
}

chrome.runtime.onMessage.addListener((message, _, respond) => {
	if (message.type === "autofill") {
		const forms = findloginforms();
		if (forms.length > 0 && message.item) {
			currentform = forms[0];
			fill(currentform, message.item);
		}
		respond({ success: true });
		return true;
	}

	if (message.type === "getforms") {
		const forms = findloginforms();
		respond({ hasforms: forms.length > 0 });
		return true;
	}
});

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
