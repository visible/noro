import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export async function shownotification(
	title: string,
	body: string,
): Promise<void> {
	return invoke("tray_show_notification", { title, body });
}

export async function setautostart(enabled: boolean): Promise<void> {
	return invoke("tray_set_autostart", { enabled });
}

export async function getautostart(): Promise<boolean> {
	return invoke("tray_get_autostart");
}

export async function onvaultlock(callback: () => void): Promise<() => void> {
	const unlisten = await listen("vault_lock", callback);
	return unlisten;
}

export async function onpasswordcopied(
	callback: (password: string) => void,
): Promise<() => void> {
	const unlisten = await listen<string>("password_copied", (event) => {
		callback(event.payload);
	});
	return unlisten;
}
