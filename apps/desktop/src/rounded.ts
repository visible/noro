import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

export async function enableRoundedCorners(radius = 12): Promise<void> {
	try {
		const window = getCurrentWebviewWindow();
		await invoke("enable_rounded_corners", {
			window,
			cornerRadius: radius,
		});
	} catch (error) {
		console.error("Failed to enable rounded corners:", error);
	}
}
