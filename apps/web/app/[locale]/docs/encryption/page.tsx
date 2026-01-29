import type { Metadata, Viewport } from "next";
import { Header, Section, Code, Prevnext } from "../components";

export const metadata: Metadata = {
	title: "Encryption",
	description: "how noro keeps your secrets safe with end-to-end encryption.",
};

export const viewport: Viewport = {
	themeColor: "#0a0a0a",
};

export default function Encryption() {
	return (
		<article className="py-12">
			<Header
				section="Security"
				title="Encryption"
				description="zero-knowledge architecture. we never see your decrypted data."
			/>

			<Section id="algorithm" title="Algorithm">
				<p className="text-white/60 mb-4 max-w-2xl">
					noro uses <strong className="text-[#ededed]">AES-256-GCM</strong> for encryption. this is the same algorithm used by governments and financial institutions worldwide.
				</p>
				<ul className="space-y-2 text-white/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span><strong className="text-[#ededed]">AES-256:</strong> 256-bit key, virtually unbreakable</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span><strong className="text-[#ededed]">GCM mode:</strong> authenticated encryption with integrity check</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span><strong className="text-[#ededed]">random IV:</strong> unique initialization vector per secret</span>
					</li>
				</ul>
			</Section>

			<Section id="flow" title="How it works">
				<p className="text-white/60 mb-6 max-w-2xl">
					when you create a secret:
				</p>
				<Code>{`1. generate random 256-bit key
2. generate random 96-bit IV
3. encrypt data with AES-256-GCM
4. send encrypted blob to server
5. key stays in URL fragment (never sent)`}</Code>
				<p className="text-white/60 mt-6 mb-6 max-w-2xl">
					when you view a secret:
				</p>
				<Code>{`1. fetch encrypted blob from server
2. extract key from URL fragment
3. decrypt locally in browser
4. server deletes the encrypted blob`}</Code>
			</Section>

			<Section id="key-storage" title="Key storage">
				<p className="text-white/60 mb-4 max-w-2xl">
					the encryption key is stored in the URL fragment (the part after <code className="text-[#d4b08c]">#</code>):
				</p>
				<Code>https://noro.sh/abc123#encryption_key_here</Code>
				<p className="text-white/60 mt-6 mb-4 max-w-2xl">
					URL fragments are special:
				</p>
				<ul className="space-y-2 text-white/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>never sent to the server in HTTP requests</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>not included in server logs</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>only accessible by JavaScript in the browser</span>
					</li>
				</ul>
			</Section>

			<Section id="zero-knowledge" title="Zero-knowledge">
				<p className="text-white/60 mb-4 max-w-2xl">
					our servers never have access to:
				</p>
				<ul className="space-y-2 text-white/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>your original secret content</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>the encryption key</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>any way to decrypt the stored data</span>
					</li>
				</ul>
				<p className="text-white/60 mt-4 max-w-2xl">
					even if our database was compromised, attackers would only get encrypted blobs that are useless without the keys.
				</p>
			</Section>

			<Section id="deletion" title="Secure deletion">
				<p className="text-white/60 mb-4 max-w-2xl">
					secrets are permanently deleted:
				</p>
				<ul className="space-y-2 text-white/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>immediately after being viewed (or after view limit reached)</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>automatically when TTL expires</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>no backups are kept of expired secrets</span>
					</li>
				</ul>
			</Section>

			<Prevnext />
		</article>
	);
}
