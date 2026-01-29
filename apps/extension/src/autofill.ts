import type { Credential, VaultItem } from "./types";
import type { LoginForm } from "./detector";
import { setvalue } from "./detector";
import { generatepassword } from "./crypto";

type CredentialLike = Credential | VaultItem;

let popup: HTMLDivElement | null = null;

export function createpopup(
	credentials: CredentialLike[],
	anchor: HTMLInputElement,
	onselect: (cred: CredentialLike) => void,
	onsave: () => void,
	ongenerate?: (password: string) => void
): void {
	removepopup();

	popup = document.createElement("div");
	popup.id = "noro-autofill";

	const style = document.createElement("style");
	style.textContent = `
		#noro-autofill {
			position: fixed;
			z-index: 2147483647;
			background: #1a1a1a;
			border: 1px solid rgba(255, 255, 255, 0.1);
			border-radius: 8px;
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
			font-family: ui-monospace, monospace;
			font-size: 13px;
			color: #fff;
			min-width: 240px;
			max-width: 320px;
			overflow: hidden;
		}
		#noro-autofill .noro-header {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 10px 12px;
			border-bottom: 1px solid rgba(255, 255, 255, 0.08);
			color: #d4b08c;
			font-size: 11px;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}
		#noro-autofill .noro-list {
			max-height: 200px;
			overflow-y: auto;
		}
		#noro-autofill .noro-item {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 10px 12px;
			cursor: pointer;
			transition: background 0.1s;
			border: none;
			background: transparent;
			width: 100%;
			text-align: left;
		}
		#noro-autofill .noro-item:hover {
			background: rgba(255, 255, 255, 0.05);
		}
		#noro-autofill .noro-icon {
			width: 28px;
			height: 28px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: rgba(212, 176, 140, 0.15);
			border-radius: 6px;
			color: #d4b08c;
			font-size: 12px;
			flex-shrink: 0;
		}
		#noro-autofill .noro-info {
			flex: 1;
			min-width: 0;
		}
		#noro-autofill .noro-title {
			font-size: 13px;
			color: #fff;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		#noro-autofill .noro-subtitle {
			font-size: 11px;
			color: rgba(255, 255, 255, 0.4);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		#noro-autofill .noro-actions {
			display: flex;
			gap: 4px;
		}
		#noro-autofill .noro-btn {
			width: 24px;
			height: 24px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: rgba(255, 255, 255, 0.08);
			border: none;
			border-radius: 4px;
			color: rgba(255, 255, 255, 0.5);
			cursor: pointer;
			transition: all 0.1s;
		}
		#noro-autofill .noro-btn:hover {
			background: rgba(212, 176, 140, 0.2);
			color: #d4b08c;
		}
		#noro-autofill .noro-empty {
			padding: 20px 12px;
			text-align: center;
			color: rgba(255, 255, 255, 0.4);
			font-size: 12px;
		}
		#noro-autofill .noro-generate {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 10px 12px;
			border-top: 1px solid rgba(255, 255, 255, 0.08);
			cursor: pointer;
			transition: background 0.1s;
		}
		#noro-autofill .noro-generate:hover {
			background: rgba(255, 255, 255, 0.05);
		}
		#noro-autofill .noro-save {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 10px 12px;
			cursor: pointer;
			transition: background 0.1s;
		}
		#noro-autofill .noro-save:hover {
			background: rgba(255, 255, 255, 0.05);
		}
	`;
	popup.appendChild(style);

	const header = document.createElement("div");
	header.className = "noro-header";
	header.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5,3.875 C19.7782,3.875 21.625,5.72183 21.625,8 C21.625,9.2471 21.0714,10.36501 20.1971,11.12122 C20.4748,11.86972 20.625,12.66939 20.625,13.5 C20.625,15.89 19.382,18.0188 17.4446,19.4143 C17.1624,19.6176 16.8653,19.8054 16.5551,19.9763 L16.5183,19.9964 C15.2037,20.7125 13.6559,21.125 12,21.125 C10.34411,21.125 8.79628,20.7124 7.48166,19.9964 C7.1745,19.8291 6.88004,19.6452 6.59991,19.4462 L6.55539,19.4143 C4.61803,18.0188 3.375,15.89 3.375,13.5 C3.375,12.66939 3.52525,11.86971 3.80294,11.12122 C2.92856,10.36501 2.375,9.2471 2.375,8 C2.375,5.72183 4.22183,3.875 6.5,3.875 C8.07432,3.875 9.44244,4.75696 10.1376,6.05321 C10.73749,5.9365 11.36069,5.875 12,5.875 C12.6393,5.875 13.2625,5.9365 13.8624,6.05321 C14.5576,4.75696 15.9257,3.875 17.5,3.875 Z"/></svg>noro`;
	popup.appendChild(header);

	const list = document.createElement("div");
	list.className = "noro-list";

	if (credentials.length === 0) {
		const empty = document.createElement("div");
		empty.className = "noro-empty";
		empty.textContent = "no saved logins for this site";
		list.appendChild(empty);
	} else {
		for (const cred of credentials) {
			const item = document.createElement("button");
			item.className = "noro-item";

			const icon = document.createElement("div");
			icon.className = "noro-icon";
			icon.textContent = "K";

			const info = document.createElement("div");
			info.className = "noro-info";

			const title = document.createElement("div");
			title.className = "noro-title";
			title.textContent = "title" in cred ? cred.title : cred.site;

			const subtitle = document.createElement("div");
			subtitle.className = "noro-subtitle";
			subtitle.textContent = cred.username || "";

			info.appendChild(title);
			info.appendChild(subtitle);

			const actions = document.createElement("div");
			actions.className = "noro-actions";

			const copybtn = document.createElement("button");
			copybtn.className = "noro-btn";
			copybtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
			copybtn.addEventListener("click", async (e) => {
				e.stopPropagation();
				if (cred.password) {
					await navigator.clipboard.writeText(cred.password);
				}
			});

			actions.appendChild(copybtn);

			item.appendChild(icon);
			item.appendChild(info);
			item.appendChild(actions);

			item.addEventListener("click", () => {
				onselect(cred);
				removepopup();
			});

			list.appendChild(item);
		}
	}

	popup.appendChild(list);

	if (credentials.length === 0) {
		const save = document.createElement("div");
		save.className = "noro-save";
		save.innerHTML = `
			<div class="noro-icon">
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
					<polyline points="17 21 17 13 7 13 7 21"/>
					<polyline points="7 3 7 8 15 8"/>
				</svg>
			</div>
			<div class="noro-info">
				<div class="noro-title">save after login</div>
				<div class="noro-subtitle">capture credentials on submit</div>
			</div>
		`;
		save.addEventListener("click", () => {
			onsave();
			removepopup();
		});
		popup.appendChild(save);
	}

	if (ongenerate) {
		const generate = document.createElement("div");
		generate.className = "noro-generate";
		generate.innerHTML = `
			<div class="noro-icon">
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
				</svg>
			</div>
			<div class="noro-info">
				<div class="noro-title">generate password</div>
				<div class="noro-subtitle">create strong password</div>
			</div>
		`;
		generate.addEventListener("click", () => {
			const password = generatepassword();
			ongenerate(password);
			removepopup();
		});
		popup.appendChild(generate);
	}

	document.body.appendChild(popup);
	positionpopup(anchor);

	const close = (e: MouseEvent) => {
		if (popup && !popup.contains(e.target as Node)) {
			removepopup();
			document.removeEventListener("click", close);
		}
	};
	setTimeout(() => document.addEventListener("click", close), 0);

	document.addEventListener("keydown", handleescape);
}

function positionpopup(anchor: HTMLInputElement): void {
	if (!popup) return;

	const rect = anchor.getBoundingClientRect();
	popup.style.top = `${rect.bottom + 4}px`;
	popup.style.left = `${rect.left}px`;

	const popuprect = popup.getBoundingClientRect();

	if (popuprect.bottom > window.innerHeight) {
		popup.style.top = `${rect.top - popuprect.height - 4}px`;
	}

	if (popuprect.right > window.innerWidth) {
		popup.style.left = `${window.innerWidth - popuprect.width - 8}px`;
	}
}

function handleescape(e: KeyboardEvent): void {
	if (e.key === "Escape") {
		removepopup();
	}
}

export function removepopup(): void {
	if (popup) {
		popup.remove();
		popup = null;
	}
	document.removeEventListener("keydown", handleescape);
}

export function createicon(onclick: () => void): HTMLDivElement {
	const icon = document.createElement("div");
	icon.style.cssText = `
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(212, 176, 140, 0.15);
		border-radius: 4px;
		cursor: pointer;
		z-index: 10000;
		transition: background 0.1s;
	`;
	icon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="#d4b08c" aria-hidden="true"><path d="M17.5,3.875 C19.7782,3.875 21.625,5.72183 21.625,8 C21.625,9.2471 21.0714,10.36501 20.1971,11.12122 C20.4748,11.86972 20.625,12.66939 20.625,13.5 C20.625,15.89 19.382,18.0188 17.4446,19.4143 C17.1624,19.6176 16.8653,19.8054 16.5551,19.9763 L16.5183,19.9964 C15.2037,20.7125 13.6559,21.125 12,21.125 C10.34411,21.125 8.79628,20.7124 7.48166,19.9964 C7.1745,19.8291 6.88004,19.6452 6.59991,19.4462 L6.55539,19.4143 C4.61803,18.0188 3.375,15.89 3.375,13.5 C3.375,12.66939 3.52525,11.86971 3.80294,11.12122 C2.92856,10.36501 2.375,9.2471 2.375,8 C2.375,5.72183 4.22183,3.875 6.5,3.875 C8.07432,3.875 9.44244,4.75696 10.1376,6.05321 C10.73749,5.9365 11.36069,5.875 12,5.875 C12.6393,5.875 13.2625,5.9365 13.8624,6.05321 C14.5576,4.75696 15.9257,3.875 17.5,3.875 Z"/></svg>`;

	icon.addEventListener("mouseenter", () => {
		icon.style.background = "rgba(212, 176, 140, 0.25)";
	});
	icon.addEventListener("mouseleave", () => {
		icon.style.background = "rgba(212, 176, 140, 0.15)";
	});
	icon.addEventListener("click", (e) => {
		e.preventDefault();
		e.stopPropagation();
		onclick();
	});

	return icon;
}

export function fill(form: LoginForm, cred: { username?: string; password?: string }): void {
	if (cred.username) {
		setvalue(form.username, cred.username);
	}
	if (cred.password) {
		setvalue(form.password, cred.password);
	}
}

export function fillpassword(form: LoginForm, password: string): void {
	setvalue(form.password, password);
}
