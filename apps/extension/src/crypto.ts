export function generatekey(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(24));
	let key = "";
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 24; i++) {
		key += chars[bytes[i] % chars.length];
	}
	return key;
}

export async function encrypt(text: string, key: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const keydata = encoder.encode(key.padEnd(32, "0").slice(0, 32));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const cryptokey = await crypto.subtle.importKey("raw", keydata, "AES-GCM", false, ["encrypt"]);
	const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptokey, data);
	const combined = new Uint8Array(iv.length + encrypted.byteLength);
	combined.set(iv);
	combined.set(new Uint8Array(encrypted), iv.length);
	return btoa(String.fromCharCode(...combined))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

export async function decrypt(encoded: string, key: string): Promise<string> {
	const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	const iv = bytes.slice(0, 12);
	const data = bytes.slice(12);
	const keydata = new TextEncoder().encode(key.padEnd(32, "0").slice(0, 32));
	const cryptokey = await crypto.subtle.importKey("raw", keydata, "AES-GCM", false, ["decrypt"]);
	const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptokey, data);
	return new TextDecoder().decode(decrypted);
}
