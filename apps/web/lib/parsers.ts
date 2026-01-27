"use client";

import type { ItemType } from "./generated/prisma/enums";
import type { ExportItem } from "./transfer";

type ParseResult = {
	items: ExportItem[];
	errors: string[];
};

function parseline(line: string): string[] {
	const result: string[] = [];
	let current = "";
	let quoted = false;
	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		if (char === '"') {
			if (quoted && line[i + 1] === '"') {
				current += '"';
				i++;
			} else {
				quoted = !quoted;
			}
		} else if (char === "," && !quoted) {
			result.push(current);
			current = "";
		} else {
			current += char;
		}
	}
	result.push(current);
	return result;
}

function parsecsv(content: string): string[][] {
	const lines = content.split(/\r?\n/).filter((l) => l.trim());
	return lines.map(parseline);
}

function makeitem(data: Partial<ExportItem>): ExportItem {
	const now = new Date().toISOString();
	return {
		id: crypto.randomUUID(),
		type: data.type ?? "login",
		title: data.title ?? "imported",
		data: data.data ?? {},
		favorite: data.favorite ?? false,
		tags: data.tags ?? [],
		created: data.created ?? now,
		updated: data.updated ?? now,
	};
}

export function parseonepassword(content: string): ParseResult {
	const items: ExportItem[] = [];
	const errors: string[] = [];
	try {
		const data = JSON.parse(content);
		const entries = Array.isArray(data) ? data : data.items ?? [];
		for (const entry of entries) {
			const type = maptype(entry.category ?? entry.type ?? "login");
			const fields = entry.fields ?? entry.details?.fields ?? [];
			const title = entry.title ?? entry.name ?? "untitled";
			const item = makeitem({
				type,
				title,
				data: extractfields(type, fields, entry),
				favorite: entry.favorite ?? entry.trashed === false,
				tags: entry.tags ?? [],
			});
			items.push(item);
		}
	} catch (e) {
		errors.push(`failed to parse: ${e instanceof Error ? e.message : "unknown"}`);
	}
	return { items, errors };
}

export function parsebitwarden(content: string): ParseResult {
	const items: ExportItem[] = [];
	const errors: string[] = [];
	try {
		const data = JSON.parse(content);
		const entries = data.items ?? [];
		for (const entry of entries) {
			const type = bitwardentype(entry.type);
			const item = makeitem({
				type,
				title: entry.name ?? "untitled",
				data: bitwardendata(type, entry),
				favorite: entry.favorite ?? false,
				tags: entry.folderId ? [entry.folderId] : [],
			});
			items.push(item);
		}
	} catch (e) {
		errors.push(`failed to parse: ${e instanceof Error ? e.message : "unknown"}`);
	}
	return { items, errors };
}

function csvtoitems(content: string, mapper: (obj: Record<string, string>) => Partial<ExportItem>): ParseResult {
	const items: ExportItem[] = [];
	const errors: string[] = [];
	try {
		const rows = parsecsv(content);
		const headers = rows[0]?.map((h) => h.toLowerCase()) ?? [];
		for (let i = 1; i < rows.length; i++) {
			const obj: Record<string, string> = {};
			headers.forEach((h, idx) => (obj[h] = rows[i][idx] ?? ""));
			items.push(makeitem(mapper(obj)));
		}
	} catch (e) {
		errors.push(`failed to parse: ${e instanceof Error ? e.message : "unknown"}`);
	}
	return { items, errors };
}

export function parselastpass(content: string): ParseResult {
	return csvtoitems(content, (o) => ({
		type: "login",
		title: o.name || o.url || "untitled",
		data: { username: o.username ?? "", password: o.password ?? "", url: o.url ?? "", notes: o.extra ?? o.notes ?? "", totp: o.totp ?? "" },
		tags: o.grouping ? [o.grouping] : [],
	}));
}

export function parsechrome(content: string): ParseResult {
	return csvtoitems(content, (o) => ({
		type: "login",
		title: o.name || o.origin || o.url || "untitled",
		data: { username: o.username ?? "", password: o.password ?? "", url: o.origin ?? o.url ?? "", notes: o.note ?? "" },
	}));
}

function maptype(category: string): ItemType {
	const map: Record<string, ItemType> = {
		login: "login",
		password: "login",
		"secure note": "note",
		note: "note",
		credit_card: "card",
		card: "card",
		identity: "identity",
		ssh_key: "ssh",
		ssh: "ssh",
		api_credential: "api",
		api: "api",
	};
	return map[category.toLowerCase()] ?? "login";
}

function bitwardentype(type: number): ItemType {
	const map: Record<number, ItemType> = { 1: "login", 2: "note", 3: "card", 4: "identity" };
	return map[type] ?? "login";
}

function extractfields(
	type: ItemType,
	fields: Array<{ name?: string; designation?: string; value?: string }>,
	entry: Record<string, unknown>
): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const field of fields) {
		const key = field.designation ?? field.name ?? "";
		const val = field.value ?? "";
		if (key && val) result[key.toLowerCase()] = val;
	}
	if (entry.urls) {
		const urls = entry.urls as Array<{ href?: string }>;
		result.url = urls[0]?.href ?? "";
	}
	if (entry.notes) result.notes = entry.notes;
	return result;
}

function bitwardendata(type: ItemType, entry: Record<string, unknown>): Record<string, unknown> {
	const notes = entry.notes ?? "";
	if (type === "login") {
		const l = entry.login as Record<string, unknown> | undefined;
		const uri = (l?.uris as Array<{ uri?: string }>)?.[0]?.uri ?? "";
		return { username: l?.username ?? "", password: l?.password ?? "", url: uri, totp: l?.totp ?? "", notes };
	}
	if (type === "card") {
		const c = entry.card as Record<string, unknown> | undefined;
		return { holder: c?.cardholderName ?? "", number: c?.number ?? "", expiry: `${c?.expMonth ?? ""}/${c?.expYear ?? ""}`, cvv: c?.code ?? "", notes };
	}
	if (type === "identity") {
		const i = entry.identity as Record<string, unknown> | undefined;
		return { firstname: i?.firstName ?? "", lastname: i?.lastName ?? "", email: i?.email ?? "", phone: i?.phone ?? "", address: i?.address1 ?? "", city: i?.city ?? "", state: i?.state ?? "", zip: i?.postalCode ?? "", country: i?.country ?? "", notes };
	}
	return { content: notes };
}
