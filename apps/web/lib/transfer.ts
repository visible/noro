"use client";

import type { ItemType } from "./generated/prisma/enums";
import type { ItemDataMap } from "./types";

export type ExportItem = {
	id: string;
	type: ItemType;
	title: string;
	data: ItemDataMap[keyof ItemDataMap];
	favorite: boolean;
	tags: string[];
	created: string;
	updated: string;
};

export type ExportData = {
	version: 1;
	exported: string;
	items: ExportItem[];
};

async function derivekey(password: string, salt: Uint8Array) {
	const encoded = new TextEncoder().encode(password);
	const base = await crypto.subtle.importKey("raw", encoded, "PBKDF2", false, ["deriveKey"]);
	return crypto.subtle.deriveKey(
		{ name: "PBKDF2", salt: salt as unknown as ArrayBuffer, iterations: 100000, hash: "SHA-256" },
		base,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt", "decrypt"]
	);
}

export async function encryptexport(data: ExportData, password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const key = await derivekey(password, salt);
	const json = JSON.stringify(data);
	const encoded = new TextEncoder().encode(json);
	const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
	const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
	combined.set(salt);
	combined.set(iv, salt.length);
	combined.set(new Uint8Array(encrypted), salt.length + iv.length);
	let binary = "";
	combined.forEach((byte) => (binary += String.fromCharCode(byte)));
	return btoa(binary);
}

export async function decryptimport(encrypted: string, password: string): Promise<ExportData> {
	const binary = atob(encrypted);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	const salt = bytes.slice(0, 16);
	const iv = bytes.slice(16, 28);
	const data = bytes.slice(28);
	const key = await derivekey(password, salt);
	const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
	const json = new TextDecoder().decode(decrypted);
	return JSON.parse(json);
}

export function tocsv(items: ExportItem[]): string {
	const headers = ["title", "type", "username", "password", "url", "notes", "totp"];
	const rows = items.map((item) => {
		const d = item.data as Record<string, unknown>;
		return [
			escape(item.title),
			escape(item.type),
			escape(String(d.username ?? "")),
			escape(String(d.password ?? "")),
			escape(String(d.url ?? "")),
			escape(String(d.notes ?? d.content ?? "")),
			escape(String(d.totp ?? d.secret ?? "")),
		].join(",");
	});
	return [headers.join(","), ...rows].join("\n");
}

function escape(str: string): string {
	if (str.includes(",") || str.includes('"') || str.includes("\n")) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

export function download(content: string, filename: string, mime: string) {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
