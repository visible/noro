import type { ItemType } from "./generated/prisma/enums";
import { encrypt } from "./crypto";

type ExportFormat = "noro" | "bitwarden" | "csv";

type ExportOptions = {
	format: ExportFormat;
	encrypted: boolean;
	password?: string;
};

type VaultItem = {
	id: string;
	type: ItemType;
	title: string;
	data: string;
	favorite: boolean;
	deleted: boolean;
	createdAt: Date;
	updatedAt: Date;
	tags: { name: string }[];
};

type NoroExport = {
	version: 1;
	encrypted: boolean;
	exported: string;
	items: VaultItem[];
};

type BitwardenItem = {
	id: string;
	organizationId: null;
	folderId: null;
	type: number;
	reprompt: number;
	name: string;
	notes: string | null;
	favorite: boolean;
	login?: {
		uris: { match: null; uri: string }[] | null;
		username: string | null;
		password: string | null;
		totp: string | null;
	};
	card?: {
		cardholderName: string | null;
		brand: null;
		number: string | null;
		expMonth: string | null;
		expYear: string | null;
		code: string | null;
	};
	identity?: {
		title: null;
		firstName: string | null;
		middleName: null;
		lastName: string | null;
		address1: string | null;
		address2: null;
		address3: null;
		city: string | null;
		state: string | null;
		postalCode: string | null;
		country: string | null;
		company: null;
		email: string | null;
		phone: string | null;
		ssn: null;
		username: null;
		passportNumber: null;
		licenseNumber: null;
	};
	secureNote?: { type: number };
	creationDate: string;
	revisionDate: string;
};

type BitwardenExport = {
	encrypted: false;
	folders: never[];
	items: BitwardenItem[];
};

function parsedata(data: string): Record<string, unknown> {
	try {
		return JSON.parse(data);
	} catch {
		return {};
	}
}

function typetobitwarden(type: ItemType): number {
	const map: Record<ItemType, number> = {
		login: 1,
		note: 2,
		card: 3,
		identity: 4,
		ssh: 2,
		api: 2,
		otp: 1,
		passkey: 1,
	};
	return map[type];
}

function parseexpiry(expiry: string): { month: string | null; year: string | null } {
	if (!expiry) return { month: null, year: null };
	const parts = expiry.split("/");
	if (parts.length !== 2) return { month: null, year: null };
	const month = parts[0].padStart(2, "0");
	const year = parts[1].length === 2 ? `20${parts[1]}` : parts[1];
	return { month, year };
}

function itemtobitwarden(item: VaultItem): BitwardenItem {
	const parsed = parsedata(item.data);
	const base: BitwardenItem = {
		id: item.id,
		organizationId: null,
		folderId: null,
		type: typetobitwarden(item.type),
		reprompt: 0,
		name: item.title,
		notes: (parsed.notes as string) || null,
		favorite: item.favorite,
		creationDate: item.createdAt.toISOString(),
		revisionDate: item.updatedAt.toISOString(),
	};

	switch (item.type) {
		case "login":
		case "otp":
		case "passkey":
			base.login = {
				uris: parsed.url ? [{ match: null, uri: parsed.url as string }] : null,
				username: (parsed.username as string) || null,
				password: (parsed.password as string) || null,
				totp: (parsed.totp as string) || (parsed.secret as string) || null,
			};
			break;
		case "card": {
			const exp = parseexpiry((parsed.expiry as string) || "");
			base.card = {
				cardholderName: (parsed.holder as string) || null,
				brand: null,
				number: (parsed.number as string) || null,
				expMonth: exp.month,
				expYear: exp.year,
				code: (parsed.cvv as string) || null,
			};
			break;
		}
		case "identity":
			base.identity = {
				title: null,
				firstName: (parsed.firstname as string) || null,
				middleName: null,
				lastName: (parsed.lastname as string) || null,
				address1: (parsed.address as string) || null,
				address2: null,
				address3: null,
				city: (parsed.city as string) || null,
				state: (parsed.state as string) || null,
				postalCode: (parsed.zip as string) || null,
				country: (parsed.country as string) || null,
				company: null,
				email: (parsed.email as string) || null,
				phone: (parsed.phone as string) || null,
				ssn: null,
				username: null,
				passportNumber: null,
				licenseNumber: null,
			};
			break;
		case "note":
		case "ssh":
		case "api":
			base.secureNote = { type: 0 };
			if (item.type === "ssh") {
				base.notes = [
					parsed.privatekey ? `Private Key:\n${parsed.privatekey}` : "",
					parsed.publickey ? `Public Key:\n${parsed.publickey}` : "",
					parsed.passphrase ? `Passphrase: ${parsed.passphrase}` : "",
					parsed.notes || "",
				]
					.filter(Boolean)
					.join("\n\n");
			} else if (item.type === "api") {
				base.notes = [
					parsed.key ? `API Key: ${parsed.key}` : "",
					parsed.secret ? `Secret: ${parsed.secret}` : "",
					parsed.endpoint ? `Endpoint: ${parsed.endpoint}` : "",
					parsed.notes || "",
				]
					.filter(Boolean)
					.join("\n\n");
			} else {
				base.notes = (parsed.content as string) || null;
			}
			break;
	}

	return base;
}

function escapecsv(value: string | null | undefined): string {
	if (!value) return "";
	if (value.includes(",") || value.includes('"') || value.includes("\n")) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

export async function exportnoro(
	items: VaultItem[],
	options: { encrypted: boolean; password?: string },
): Promise<string> {
	const exportdata: NoroExport = {
		version: 1,
		encrypted: options.encrypted,
		exported: new Date().toISOString(),
		items: items.filter((i) => !i.deleted),
	};

	const json = JSON.stringify(exportdata, null, 2);

	if (options.encrypted && options.password) {
		const data = new TextEncoder().encode(json);
		const encrypted = await encrypt(data, options.password);
		return JSON.stringify({ version: 1, encrypted: true, data: encrypted });
	}

	return json;
}

export function exportbitwarden(items: VaultItem[]): string {
	const exportdata: BitwardenExport = {
		encrypted: false,
		folders: [],
		items: items.filter((i) => !i.deleted).map(itemtobitwarden),
	};
	return JSON.stringify(exportdata, null, 2);
}

export function exportcsv(items: VaultItem[]): string {
	const logins = items.filter((i) => i.type === "login" && !i.deleted);
	const headers = ["name", "url", "username", "password", "totp", "notes"];
	const rows = logins.map((item) => {
		const parsed = parsedata(item.data);
		return [
			escapecsv(item.title),
			escapecsv(parsed.url as string),
			escapecsv(parsed.username as string),
			escapecsv(parsed.password as string),
			escapecsv(parsed.totp as string),
			escapecsv(parsed.notes as string),
		].join(",");
	});
	return [headers.join(","), ...rows].join("\n");
}

export async function createexport(
	items: VaultItem[],
	options: ExportOptions,
): Promise<{ content: string; filename: string; mimetype: string }> {
	const timestamp = new Date().toISOString().split("T")[0];

	switch (options.format) {
		case "noro": {
			const content = await exportnoro(items, {
				encrypted: options.encrypted,
				password: options.password,
			});
			return {
				content,
				filename: `noro-export-${timestamp}.json`,
				mimetype: "application/json",
			};
		}
		case "bitwarden": {
			const content = exportbitwarden(items);
			return {
				content,
				filename: `bitwarden-export-${timestamp}.json`,
				mimetype: "application/json",
			};
		}
		case "csv": {
			const content = exportcsv(items);
			return {
				content,
				filename: `noro-logins-${timestamp}.csv`,
				mimetype: "text/csv",
			};
		}
	}
}
