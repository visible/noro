import { invoke } from "@tauri-apps/api/core";

export interface Session {
	token: string;
	email: string;
}

const BASE_URL = "https://noro.sh";

export async function login(email: string, password: string): Promise<Session> {
	return invoke("login", { baseUrl: BASE_URL, email, password });
}

export async function register(
	email: string,
	password: string,
	name?: string,
): Promise<Session> {
	return invoke("register", { baseUrl: BASE_URL, email, password, name });
}

export async function getSession(): Promise<Session | null> {
	return invoke("auth_get_session");
}

export async function logout(): Promise<boolean> {
	return invoke("auth_logout");
}
