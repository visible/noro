import type { ItemType } from "./generated/prisma/enums";
import type { ItemDataMap } from "./types";

type ValidationResult = { valid: true } | { valid: false; error: string };

const validators: Record<ItemType, (data: unknown) => ValidationResult> = {
	login: (data) => {
		if (typeof data !== "object" || data === null) {
			return { valid: false, error: "data must be an object" };
		}
		return { valid: true };
	},
	note: (data) => {
		if (typeof data !== "object" || data === null) {
			return { valid: false, error: "data must be an object" };
		}
		const d = data as Record<string, unknown>;
		if (typeof d.content !== "string") {
			return { valid: false, error: "content is required" };
		}
		return { valid: true };
	},
	card: (data) => {
		if (typeof data !== "object" || data === null) {
			return { valid: false, error: "data must be an object" };
		}
		const d = data as Record<string, unknown>;
		if (typeof d.holder !== "string") {
			return { valid: false, error: "holder is required" };
		}
		if (typeof d.number !== "string") {
			return { valid: false, error: "number is required" };
		}
		if (typeof d.expiry !== "string") {
			return { valid: false, error: "expiry is required" };
		}
		if (typeof d.cvv !== "string") {
			return { valid: false, error: "cvv is required" };
		}
		return { valid: true };
	},
	identity: (data) => {
		if (typeof data !== "object" || data === null) {
			return { valid: false, error: "data must be an object" };
		}
		return { valid: true };
	},
	ssh: (data) => {
		if (typeof data !== "object" || data === null) {
			return { valid: false, error: "data must be an object" };
		}
		const d = data as Record<string, unknown>;
		if (typeof d.privatekey !== "string") {
			return { valid: false, error: "privatekey is required" };
		}
		return { valid: true };
	},
	api: (data) => {
		if (typeof data !== "object" || data === null) {
			return { valid: false, error: "data must be an object" };
		}
		const d = data as Record<string, unknown>;
		if (typeof d.key !== "string") {
			return { valid: false, error: "key is required" };
		}
		return { valid: true };
	},
	otp: (data) => {
		if (typeof data !== "object" || data === null) {
			return { valid: false, error: "data must be an object" };
		}
		const d = data as Record<string, unknown>;
		if (typeof d.secret !== "string") {
			return { valid: false, error: "secret is required" };
		}
		return { valid: true };
	},
	passkey: (data) => {
		if (typeof data !== "object" || data === null) {
			return { valid: false, error: "data must be an object" };
		}
		const d = data as Record<string, unknown>;
		if (typeof d.credentialid !== "string") {
			return { valid: false, error: "credentialid is required" };
		}
		if (typeof d.publickey !== "string") {
			return { valid: false, error: "publickey is required" };
		}
		if (typeof d.rpid !== "string") {
			return { valid: false, error: "rpid is required" };
		}
		if (typeof d.origin !== "string") {
			return { valid: false, error: "origin is required" };
		}
		return { valid: true };
	},
};

export function validateitemdata<T extends ItemType>(
	type: T,
	data: unknown,
): ValidationResult {
	const validator = validators[type];
	if (!validator) {
		return { valid: false, error: `unknown item type: ${type}` };
	}
	return validator(data);
}

export function isvaliditemtype(type: string): type is ItemType {
	return [
		"login",
		"note",
		"card",
		"identity",
		"ssh",
		"api",
		"otp",
		"passkey",
	].includes(type);
}
