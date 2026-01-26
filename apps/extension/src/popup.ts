const secret = document.getElementById("secret") as HTMLTextAreaElement;
const ttl = document.getElementById("ttl") as HTMLSelectElement;
const views = document.getElementById("views") as HTMLSelectElement;
const share = document.getElementById("share") as HTMLButtonElement;
const url = document.getElementById("url") as HTMLInputElement;
const copy = document.getElementById("copy") as HTMLButtonElement;
const newbtn = document.getElementById("new") as HTMLButtonElement;
const list = document.getElementById("list") as HTMLUListElement;
const createview = document.getElementById("create") as HTMLDivElement;
const resultview = document.getElementById("result") as HTMLDivElement;

function show(view: "create" | "result") {
	createview.classList.toggle("active", view === "create");
	resultview.classList.toggle("active", view === "result");
}

share.addEventListener("click", async () => {
	const text = secret.value.trim();
	if (!text) return;

	share.disabled = true;
	share.textContent = "sharing...";

	const response = await chrome.runtime.sendMessage({
		type: "share",
		text,
		ttl: ttl.value,
		views: parseInt(views.value),
	});

	if (response.success) {
		url.value = response.url;
		show("result");
		loadrecents();
	} else {
		share.textContent = "failed";
		setTimeout(() => {
			share.textContent = "share";
			share.disabled = false;
		}, 2000);
	}
});

copy.addEventListener("click", async () => {
	await navigator.clipboard.writeText(url.value);
	copy.textContent = "copied!";
	setTimeout(() => {
		copy.textContent = "copy";
	}, 2000);
});

newbtn.addEventListener("click", () => {
	secret.value = "";
	share.textContent = "share";
	share.disabled = false;
	show("create");
});

interface RecentSecret {
	id: string;
	url: string;
	preview: string;
	created: number;
}

async function loadrecents() {
	const recents: RecentSecret[] = await chrome.runtime.sendMessage({ type: "recents" });
	list.innerHTML = "";

	if (recents.length === 0) {
		list.innerHTML = "<li class='empty'>no recent secrets</li>";
		return;
	}

	for (const item of recents) {
		const li = document.createElement("li");
		const preview = document.createElement("span");
		preview.className = "preview";
		preview.textContent = item.preview + (item.preview.length >= 50 ? "..." : "");

		const copybtn = document.createElement("button");
		copybtn.textContent = "copy";
		copybtn.addEventListener("click", async () => {
			await navigator.clipboard.writeText(item.url);
			copybtn.textContent = "copied!";
			setTimeout(() => {
				copybtn.textContent = "copy";
			}, 2000);
		});

		li.appendChild(preview);
		li.appendChild(copybtn);
		list.appendChild(li);
	}
}

loadrecents();
