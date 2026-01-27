"use client";

import { useState, useEffect, useCallback } from "react";

const base32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function decode(input: string): Uint8Array {
	const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
	const bits: number[] = [];

	for (const char of clean) {
		const val = base32.indexOf(char);
		for (let i = 4; i >= 0; i--) {
			bits.push((val >> i) & 1);
		}
	}

	const bytes: number[] = [];
	for (let i = 0; i + 8 <= bits.length; i += 8) {
		let byte = 0;
		for (let j = 0; j < 8; j++) {
			byte = (byte << 1) | bits[i + j];
		}
		bytes.push(byte);
	}

	return new Uint8Array(bytes);
}

async function hmac(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
	const cryptokey = await crypto.subtle.importKey(
		"raw",
		key as unknown as ArrayBuffer,
		{ name: "HMAC", hash: "SHA-1" },
		false,
		["sign"]
	);
	const sig = await crypto.subtle.sign("HMAC", cryptokey, data as unknown as ArrayBuffer);
	return new Uint8Array(sig);
}

async function generate(secret: string, time?: number): Promise<string> {
	const key = decode(secret);
	let counter = Math.floor((time ?? Date.now() / 1000) / 30);
	const data = new Uint8Array(8);

	for (let i = 7; i >= 0; i--) {
		data[i] = counter & 0xff;
		counter = Math.floor(counter / 256);
	}

	const hash = await hmac(key, data);
	const offset = hash[19] & 0x0f;
	const binary =
		((hash[offset] & 0x7f) << 24) |
		((hash[offset + 1] & 0xff) << 16) |
		((hash[offset + 2] & 0xff) << 8) |
		(hash[offset + 3] & 0xff);

	return (binary % 1000000).toString().padStart(6, "0");
}

interface Props {
	secret?: string;
	oncode?: (code: string) => void;
}

export function Totp({ secret: initial, oncode }: Props) {
	const [secret, setSecret] = useState(initial ?? "");
	const [code, setCode] = useState("");
	const [remaining, setRemaining] = useState(30);
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState("");

	const refresh = useCallback(async () => {
		if (!secret.trim()) {
			setCode("");
			setError("");
			return;
		}

		try {
			const result = await generate(secret);
			setCode(result);
			setError("");
			oncode?.(result);
		} catch {
			setCode("");
			setError("invalid secret");
		}
	}, [secret, oncode]);

	useEffect(() => {
		refresh();

		const interval = setInterval(() => {
			const now = Math.floor(Date.now() / 1000);
			const left = 30 - (now % 30);
			setRemaining(left);

			if (left === 30) {
				refresh();
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [refresh]);

	async function copy() {
		if (!code) return;
		await navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="max-w-md">
			<div className="mb-6">
				<label className="block text-sm text-white/60 mb-2">totp secret</label>
				<input
					type="text"
					value={secret}
					onChange={(e) => setSecret(e.target.value)}
					placeholder="JBSWY3DPEHPK3PXP"
					className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#FF6B00]/50 font-mono"
				/>
			</div>

			{error && <p className="text-red-400 text-sm mb-4">{error}</p>}

			{code && !error && (
				<div className="bg-white/5 rounded-lg p-6">
					<div className="flex items-center justify-between mb-4">
						<p className="text-4xl font-mono tracking-widest">{code}</p>
						<button
							onClick={copy}
							className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
						>
							{copied ? "copied!" : "copy"}
						</button>
					</div>

					<div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
						<div
							className="absolute inset-y-0 left-0 bg-[#FF6B00] transition-all duration-1000"
							style={{ width: `${(remaining / 30) * 100}%` }}
						/>
					</div>
					<p className="text-xs text-white/40 mt-2">{remaining}s remaining</p>
				</div>
			)}
		</div>
	);
}
