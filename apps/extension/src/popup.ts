const loginview = document.getElementById("login") as HTMLDivElement;
const vaultview = document.getElementById("vault") as HTMLDivElement;
const detailview = document.getElementById("detail") as HTMLDivElement;

const emailinput = document.getElementById("email") as HTMLInputElement;
const passwordinput = document.getElementById("password") as HTMLInputElement;
const secretkeyinput = document.getElementById("secretkey") as HTMLInputElement;
const loginerror = document.getElementById("loginerror") as HTMLParagraphElement;
const signinbtn = document.getElementById("signin") as HTMLButtonElement;

const searchinput = document.getElementById("search") as HTMLInputElement;
const itemslist = document.getElementById("items") as HTMLUListElement;
const useremail = document.getElementById("useremail") as HTMLSpanElement;
const signoutbtn = document.getElementById("signout") as HTMLButtonElement;

const backbtn = document.getElementById("back") as HTMLButtonElement;
const detailicon = document.getElementById("detailicon") as HTMLSpanElement;
const detailtitle = document.getElementById("detailtitle") as HTMLHeadingElement;
const detailtype = document.getElementById("detailtype") as HTMLParagraphElement;
const fieldscontainer = document.getElementById("fields") as HTMLDivElement;

interface Item {
	id: string;
	type: string;
	title: string;
	username?: string;
	password?: string;
	url?: string;
	notes?: string;
	favorite: boolean;
}

interface Session {
	email: string;
	token: string;
}

let items: Item[] = [];
let currentitem: Item | null = null;

const icons: Record<string, string> = {
	login: "K",
	note: "N",
	card: "C",
	identity: "I",
	ssh: "S",
	api: "A",
};

function show(view: "login" | "vault" | "detail") {
	loginview.classList.toggle("active", view === "login");
	vaultview.classList.toggle("active", view === "vault");
	detailview.classList.toggle("active", view === "detail");
}

async function getsession(): Promise<Session | null> {
	const { session } = await chrome.storage.local.get("session");
	return session || null;
}

async function setsession(session: Session | null) {
	if (session) {
		await chrome.storage.local.set({ session });
	} else {
		await chrome.storage.local.remove("session");
	}
}

async function init() {
	const session = await getsession();
	if (session) {
		useremail.textContent = session.email;
		await loaditems();
		show("vault");
	} else {
		show("login");
	}
}

signinbtn.addEventListener("click", async () => {
	const email = emailinput.value.trim();
	const password = passwordinput.value;
	const secretkey = secretkeyinput.value.trim();

	if (!email || !password || !secretkey) {
		loginerror.textContent = "all fields required";
		return;
	}

	loginerror.textContent = "";
	signinbtn.disabled = true;
	signinbtn.textContent = "signing in...";

	try {
		const response = await chrome.runtime.sendMessage({
			type: "login",
			email,
			password,
			secretkey,
		});

		if (response.success) {
			await setsession({ email, token: response.token });
			useremail.textContent = email;
			await loaditems();
			show("vault");
			emailinput.value = "";
			passwordinput.value = "";
			secretkeyinput.value = "";
		} else {
			loginerror.textContent = response.error || "login failed";
		}
	} catch {
		loginerror.textContent = "connection error";
	} finally {
		signinbtn.disabled = false;
		signinbtn.textContent = "sign in";
	}
});

signoutbtn.addEventListener("click", async () => {
	await setsession(null);
	items = [];
	searchinput.value = "";
	show("login");
});

async function loaditems() {
	const response = await chrome.runtime.sendMessage({ type: "items" });
	if (response.success) {
		items = response.items;
		renderitems();
	}
}

function renderitems() {
	const query = searchinput.value.toLowerCase();
	const filtered = items.filter(
		(item) =>
			item.title.toLowerCase().includes(query) ||
			(item.username && item.username.toLowerCase().includes(query)),
	);

	itemslist.innerHTML = "";

	if (filtered.length === 0) {
		const empty = document.createElement("li");
		empty.className = "empty";
		empty.textContent = items.length === 0 ? "no items yet" : "no matches";
		itemslist.appendChild(empty);
		return;
	}

	const sorted = [...filtered].sort((a, b) => {
		if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
		return a.title.localeCompare(b.title);
	});

	for (const item of sorted) {
		const li = document.createElement("li");
		li.addEventListener("click", () => showdetail(item));

		const icon = document.createElement("span");
		icon.className = "icon";
		icon.textContent = icons[item.type] || "?";

		const info = document.createElement("div");
		info.className = "info";

		const title = document.createElement("div");
		title.className = "title";
		title.textContent = item.title;

		const subtitle = document.createElement("div");
		subtitle.className = "subtitle";
		subtitle.textContent = item.username || item.type;

		info.appendChild(title);
		info.appendChild(subtitle);

		li.appendChild(icon);
		li.appendChild(info);

		if (item.favorite) {
			const star = document.createElement("span");
			star.className = "star";
			star.textContent = "*";
			li.appendChild(star);
		}

		itemslist.appendChild(li);
	}
}

searchinput.addEventListener("input", renderitems);

function showdetail(item: Item) {
	currentitem = item;
	detailicon.textContent = icons[item.type] || "?";
	detailtitle.textContent = item.title;
	detailtype.textContent = item.type;

	fieldscontainer.innerHTML = "";

	if (item.username) {
		fieldscontainer.appendChild(createfield("username", item.username, false));
	}

	if (item.password) {
		fieldscontainer.appendChild(createfield("password", item.password, true));
	}

	if (item.url) {
		fieldscontainer.appendChild(createfield("url", item.url, false, true));
	}

	if (item.notes) {
		fieldscontainer.appendChild(createfield("notes", item.notes, false));
	}

	show("detail");
}

function createfield(
	label: string,
	value: string,
	ispassword: boolean,
	isurl = false,
): HTMLDivElement {
	const field = document.createElement("div");
	field.className = "field";

	const labelel = document.createElement("div");
	labelel.className = "label";
	labelel.textContent = label;

	const valueel = document.createElement("div");
	valueel.className = "value";

	const textel = document.createElement("span");
	textel.className = ispassword ? "text password" : "text";

	let hidden = ispassword;
	const displayvalue = () => {
		textel.textContent = hidden ? "••••••••••" : value;
	};
	displayvalue();

	const actions = document.createElement("div");
	actions.className = "actions";

	const copybtn = document.createElement("button");
	copybtn.type = "button";
	copybtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
	copybtn.addEventListener("click", async () => {
		await navigator.clipboard.writeText(value);
		copybtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>`;
		setTimeout(() => {
			copybtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
		}, 1500);
	});

	actions.appendChild(copybtn);

	if (ispassword) {
		const togglebtn = document.createElement("button");
		togglebtn.type = "button";
		togglebtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
		togglebtn.addEventListener("click", () => {
			hidden = !hidden;
			displayvalue();
			togglebtn.innerHTML = hidden
				? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`
				: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`;
		});
		actions.appendChild(togglebtn);
	}

	if (isurl) {
		const openbtn = document.createElement("button");
		openbtn.type = "button";
		openbtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>`;
		openbtn.addEventListener("click", () => {
			let url = value;
			if (!url.startsWith("http://") && !url.startsWith("https://")) {
				url = "https://" + url;
			}
			chrome.tabs.create({ url });
		});
		actions.appendChild(openbtn);
	}

	valueel.appendChild(textel);
	valueel.appendChild(actions);
	field.appendChild(labelel);
	field.appendChild(valueel);

	return field;
}

backbtn.addEventListener("click", () => {
	currentitem = null;
	show("vault");
});

init();
