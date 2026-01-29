"use client";

import { useState } from "react";

interface Props {
	secretkey: string;
	oncomplete: () => void;
}

export function SecretKey({ secretkey, oncomplete }: Props) {
	const [copied, setCopied] = useState(false);
	const [confirmed, setConfirmed] = useState(false);

	async function copytoClipboard() {
		await navigator.clipboard.writeText(secretkey);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="w-full max-w-[400px]">
			<div className="mb-8">
				<h2 className="font-serif text-2xl text-[#ededed] mb-3">
					Save your Secret Key
				</h2>
				<p className="text-white/50 text-sm leading-relaxed">
					This key, combined with your master password, protects your vault.
					Store it somewhere safe. You will need it to sign in on new devices.
				</p>
			</div>

			<div className="mb-6">
				<div className="p-4 bg-white/3 border border-white/10 rounded-lg">
					<p className="text-xs text-white/40 uppercase tracking-wider mb-3">
						Your Secret Key
					</p>
					<p className="font-mono text-sm text-[#d4b08c] break-all leading-relaxed">
						{secretkey}
					</p>
				</div>
			</div>

			<button
				type="button"
				onClick={copytoClipboard}
				className="w-full py-3 mb-4 bg-white/5 border border-white/10 text-[#ededed] font-medium rounded-lg hover:bg-white/10 transition-all duration-200"
			>
				{copied ? "Copied!" : "Copy to clipboard"}
			</button>

			<div className="flex items-start gap-3 mb-6 p-4 bg-white/3 border border-white/10 rounded-lg">
				<input
					type="checkbox"
					id="confirm"
					checked={confirmed}
					onChange={(e) => setConfirmed(e.target.checked)}
					className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-[#d4b08c] focus:ring-[#d4b08c]/50"
				/>
				<label htmlFor="confirm" className="text-sm text-white/60 leading-relaxed cursor-pointer">
					I have saved my secret key in a secure location. I understand that
					without it, I cannot access my vault on new devices.
				</label>
			</div>

			<button
				type="button"
				onClick={oncomplete}
				disabled={!confirmed}
				className="w-full py-3.5 bg-[#ededed] text-[#0a0a0a] font-medium rounded-lg hover:bg-[#d4b08c] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Continue to vault
			</button>

			<div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
				<p className="text-xs text-amber-400/80 leading-relaxed">
					<strong>Important:</strong> We cannot recover this key. If you lose
					both your master password and secret key, your data is permanently
					inaccessible.
				</p>
			</div>
		</div>
	);
}
