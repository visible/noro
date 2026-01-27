"use client";

import type { ItemType } from "@/lib/generated/prisma/enums";

interface FieldConfig {
	name: string;
	label: string;
	type: "text" | "password" | "textarea" | "url" | "email" | "number";
	required?: boolean;
	half?: boolean;
}

export const fieldConfigs: Record<ItemType, FieldConfig[]> = {
	login: [
		{ name: "username", label: "username", type: "text" },
		{ name: "password", label: "password", type: "password", required: true },
		{ name: "url", label: "website url", type: "url" },
		{ name: "totp", label: "totp secret", type: "password" },
		{ name: "notes", label: "notes", type: "textarea" },
	],
	note: [{ name: "content", label: "content", type: "textarea", required: true }],
	card: [
		{ name: "holder", label: "cardholder name", type: "text", required: true },
		{ name: "number", label: "card number", type: "password", required: true },
		{ name: "expiry", label: "expiry (mm/yy)", type: "text", required: true, half: true },
		{ name: "cvv", label: "cvv", type: "password", required: true, half: true },
		{ name: "pin", label: "pin", type: "password" },
		{ name: "notes", label: "notes", type: "textarea" },
	],
	identity: [
		{ name: "firstname", label: "first name", type: "text", half: true },
		{ name: "lastname", label: "last name", type: "text", half: true },
		{ name: "email", label: "email", type: "email" },
		{ name: "phone", label: "phone", type: "text" },
		{ name: "address", label: "address", type: "text" },
		{ name: "city", label: "city", type: "text", half: true },
		{ name: "state", label: "state", type: "text", half: true },
		{ name: "zip", label: "zip code", type: "text", half: true },
		{ name: "country", label: "country", type: "text", half: true },
		{ name: "notes", label: "notes", type: "textarea" },
	],
	ssh: [
		{ name: "privatekey", label: "private key", type: "textarea", required: true },
		{ name: "publickey", label: "public key", type: "textarea" },
		{ name: "passphrase", label: "passphrase", type: "password" },
		{ name: "notes", label: "notes", type: "textarea" },
	],
	api: [
		{ name: "key", label: "api key", type: "password", required: true },
		{ name: "secret", label: "api secret", type: "password" },
		{ name: "endpoint", label: "endpoint url", type: "url" },
		{ name: "notes", label: "notes", type: "textarea" },
	],
	otp: [
		{ name: "secret", label: "secret", type: "password", required: true },
		{ name: "issuer", label: "issuer", type: "text", half: true },
		{ name: "account", label: "account", type: "text", half: true },
		{ name: "digits", label: "digits", type: "number", half: true },
		{ name: "period", label: "period (seconds)", type: "number", half: true },
	],
	passkey: [
		{ name: "credentialid", label: "credential id", type: "text", required: true },
		{ name: "publickey", label: "public key", type: "textarea", required: true },
		{ name: "rpid", label: "relying party id", type: "text", required: true },
		{ name: "origin", label: "origin", type: "url", required: true },
		{ name: "notes", label: "notes", type: "textarea" },
	],
};
