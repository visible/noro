import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Header, Section, Prevnext } from "./components";

export const metadata: Metadata = {
	title: "Introduction",
	description: "noro is a one-time secret sharing tool for env vars. share secrets securely with links that self-destruct.",
};

export const viewport: Viewport = {
	themeColor: "#0a0a0a",
};

export default function Docs() {
	return (
		<article className="py-12">
			<Header
				section="Get Started"
				title="Introduction"
				description="noro is a one-time secret sharing tool for env vars. share secrets securely with links that self-destruct."
			/>

			<Section id="overview" title="Overview">
				<p className="text-white/60 mb-4 max-w-2xl">
					sharing secrets like API keys and credentials is risky. most people paste them in slack, email, or text messages where they can be intercepted or logged.
				</p>
				<p className="text-white/60 max-w-2xl">
					noro encrypts your secrets client-side before upload. the decryption key stays in the URL fragment and is never sent to our servers. once the secret is viewed, it&apos;s permanently deleted.
				</p>
			</Section>

			<Section id="features" title="Features">
				<div className="space-y-8">
					<div>
						<h3 id="one-time-links" className="text-xl font-semibold mb-3 text-[#ededed]">one-time links</h3>
						<p className="text-white/60 max-w-2xl">
							each secret generates a unique link that can only be viewed once. after viewing, the encrypted data is permanently deleted from our servers.
						</p>
					</div>
					<div>
						<h3 id="e2e-encryption" className="text-xl font-semibold mb-3 text-[#ededed]">end-to-end encryption</h3>
						<p className="text-white/60 max-w-2xl">
							secrets are encrypted using AES-256-GCM before leaving your browser. the decryption key stays in the URL fragment, which is never sent to servers.
						</p>
					</div>
					<div>
						<h3 id="cli-tool" className="text-xl font-semibold mb-3 text-[#ededed]">CLI tool</h3>
						<p className="text-white/60 max-w-2xl">
							share env vars directly from your terminal. the CLI can read from your environment and automatically write claimed secrets to .env files.
						</p>
					</div>
					<div>
						<h3 id="file-sharing" className="text-xl font-semibold mb-3 text-[#ededed]">file sharing</h3>
						<p className="text-white/60 max-w-2xl">
							upload and share encrypted files up to 5MB. perfect for sharing certificates, keys, and other sensitive files.
						</p>
					</div>
					<div>
						<h3 id="view-limits" className="text-xl font-semibold mb-3 text-[#ededed]">view limits</h3>
						<p className="text-white/60 max-w-2xl">
							set how many times a secret can be viewed before it&apos;s deleted. useful when sharing with multiple team members.
						</p>
					</div>
					<div>
						<h3 id="expiry" className="text-xl font-semibold mb-3 text-[#ededed]">auto-expiry</h3>
						<p className="text-white/60 max-w-2xl">
							secrets automatically expire after a set time period. choose from 1 hour to 7 days.
						</p>
					</div>
				</div>
			</Section>

			<section className="mb-12">
				<h2 id="next-steps" className="text-3xl font-semibold mb-8 text-[#ededed]">Next steps</h2>
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
					<Link href="/docs/cli" className="block border border-white/10 rounded-xl p-6 hover:bg-white/5 transition-colors">
						<h3 className="font-semibold mb-2 text-[#ededed]">CLI</h3>
						<p className="text-sm text-white/50">share secrets from terminal</p>
					</Link>
					<Link href="/docs/web" className="block border border-white/10 rounded-xl p-6 hover:bg-white/5 transition-colors">
						<h3 className="font-semibold mb-2 text-[#ededed]">Web</h3>
						<p className="text-sm text-white/50">use the website interface</p>
					</Link>
					<Link href="/docs/encryption" className="block border border-white/10 rounded-xl p-6 hover:bg-white/5 transition-colors">
						<h3 className="font-semibold mb-2 text-[#ededed]">Encryption</h3>
						<p className="text-sm text-white/50">how we keep your data safe</p>
					</Link>
				</div>
			</section>

			<Prevnext />
		</article>
	);
}
