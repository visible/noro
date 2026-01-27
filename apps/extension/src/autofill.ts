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

let popup: HTMLDivElement | null = null;

export function createpopup(
	credentials: Credential[],
	anchor: HTMLInputElement,
	onselect: (cred: Credential) => void,
	onsave: () => void
): void {
	removepopup();

	popup = document.createElement("div");
	popup.id = "noro-autofill";

	const rect = anchor.getBoundingClientRect();
	popup.style.cssText = `
		position: fixed;
		top: ${rect.bottom + 4}px;
		left: ${rect.left}px;
		min-width: ${Math.max(rect.width, 200)}px;
		max-width: 300px;
		background: #1a1a1a;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
		font-family: ui-sans-serif, system-ui, sans-serif;
		font-size: 13px;
		z-index: 2147483647;
		overflow: hidden;
	`;

	const header = document.createElement("div");
	header.style.cssText = `
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		color: #ff6b00;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	`;
	header.textContent = "noro";
	popup.appendChild(header);

	if (credentials.length === 0) {
		const empty = document.createElement("div");
		empty.style.cssText = `
			padding: 16px 12px;
			color: rgba(255, 255, 255, 0.4);
			text-align: center;
		`;
		empty.textContent = "no saved logins";
		popup.appendChild(empty);

		const save = document.createElement("button");
		save.style.cssText = `
			width: calc(100% - 16px);
			margin: 0 8px 8px;
			padding: 10px;
			background: #ff6b00;
			color: #000;
			border: none;
			border-radius: 6px;
			font-size: 12px;
			font-weight: 600;
			cursor: pointer;
		`;
		save.textContent = "save after login";
		save.addEventListener("click", () => {
			onsave();
			removepopup();
		});
		popup.appendChild(save);
	} else {
		const list = document.createElement("div");
		list.style.cssText = "max-height: 200px; overflow-y: auto;";

		for (const cred of credentials) {
			const item = document.createElement("button");
			item.style.cssText = `
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				width: 100%;
				padding: 10px 12px;
				background: transparent;
				border: none;
				border-bottom: 1px solid rgba(255, 255, 255, 0.05);
				cursor: pointer;
				text-align: left;
			`;
			item.addEventListener("mouseenter", () => {
				item.style.background = "rgba(255, 107, 0, 0.1)";
			});
			item.addEventListener("mouseleave", () => {
				item.style.background = "transparent";
			});
			item.addEventListener("click", () => {
				onselect(cred);
				removepopup();
			});

			const username = document.createElement("span");
			username.style.cssText = "color: #fff; font-weight: 500;";
			username.textContent = cred.username;

			const site = document.createElement("span");
			site.style.cssText = "color: rgba(255, 255, 255, 0.4); font-size: 11px;";
			site.textContent = cred.site;

			item.appendChild(username);
			item.appendChild(site);
			list.appendChild(item);
		}

		popup.appendChild(list);
	}

	document.body.appendChild(popup);

	const close = (e: MouseEvent) => {
		if (popup && !popup.contains(e.target as Node)) {
			removepopup();
			document.removeEventListener("click", close);
		}
	};
	setTimeout(() => document.addEventListener("click", close), 0);
}

export function removepopup(): void {
	if (popup) {
		popup.remove();
		popup = null;
	}
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
		background: #ff6b00;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
	`;
	icon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="#000" aria-hidden="true"><path d="M12 2C9.24 2 7 4.24 7 7v3H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v3H9V7c0-1.66 1.34-3 3-3z"/></svg>`;

	icon.addEventListener("click", (e) => {
		e.preventDefault();
		e.stopPropagation();
		onclick();
	});

	return icon;
}
