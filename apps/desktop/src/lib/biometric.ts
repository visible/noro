import { invoke } from "@tauri-apps/api/core";

export async function isavailable(): Promise<boolean> {
	return invoke("biometric_available");
}

export async function authenticate(reason: string): Promise<boolean> {
	return invoke("biometric_authenticate", { reason });
}

export async function isenabled(): Promise<boolean> {
	return invoke("biometric_enabled");
}

export async function enablebiometric(): Promise<void> {
	return invoke("biometric_enable");
}

export async function disablebiometric(): Promise<void> {
	return invoke("biometric_disable");
}

export async function unlock(): Promise<boolean> {
	return invoke("biometric_unlock");
}
