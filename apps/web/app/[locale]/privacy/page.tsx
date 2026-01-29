import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";

export const metadata = {
	title: "privacy policy - noro",
	description: "privacy policy for noro",
};

export default function Privacy() {
	return (
		<div className="min-h-dvh bg-[#0a0a0a] text-[#ededed] antialiased selection:bg-[#d4b08c] selection:text-black font-sans relative">
			<nav className="top-0 right-0 left-0 px-6 py-6">
				<div className="flex justify-between items-center mx-auto max-w-6xl">
					<Link href="/" className="flex gap-2 items-center group">
						<div className="text-[#ededed] group-hover:text-[#d4b08c] transition-colors duration-300">
							<Logo />
						</div>
						<span className="font-serif italic text-lg tracking-wide text-[#ededed]">noro</span>
					</Link>
					<div className="hidden gap-8 items-center px-6 py-2 rounded-full border shadow-lg backdrop-blur-md md:flex bg-white/3 border-white/5 shadow-black/20">
						<Link href="/docs" className="text-sm font-medium text-white/60 hover:text-[#d4b08c] transition-colors">Documentation</Link>
						<Link href="/privacy" className="text-sm font-medium text-white hover:text-[#d4b08c] transition-colors">Privacy</Link>
						<Link href="/terms" className="text-sm font-medium text-white/60 hover:text-[#d4b08c] transition-colors">Terms</Link>
					</div>
					<div className="md:hidden">
						<div className="w-8 h-8 rounded-full bg-white/10"></div>
					</div>
				</div>
			</nav>

			<main className="px-6 py-16 relative z-10">
				<article className="mx-auto max-w-6xl">
					<header className="mb-16">
						<h1 className="font-serif text-4xl sm:text-5xl text-[#ededed] mb-4">privacy policy</h1>
						<p className="text-white/40 text-sm">last updated: january 28, 2026</p>
					</header>

					<div className="prose prose-invert prose-sm max-w-none space-y-12">
						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">our commitment</h2>
							<p className="text-white/60 leading-relaxed">
								noro is built on the principle of privacy by design. we believe you should have complete control over your data. this policy explains what information we collect, how we use it, and the measures we take to protect your privacy.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">zero-knowledge encryption</h2>
							<p className="text-white/60 leading-relaxed mb-4">
								noro uses end-to-end encryption with a zero-knowledge architecture:
							</p>
							<ul className="list-disc list-inside text-white/60 space-y-2 ml-4">
								<li>all secrets and vault contents are encrypted client-side using AES-256-GCM</li>
								<li>encryption keys are derived from your master password using Argon2id</li>
								<li>we never have access to your unencrypted data or encryption keys</li>
								<li>even if compelled by law, we cannot provide your decrypted data</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">information we collect</h2>
							
							<h3 className="text-lg text-[#ededed] mt-6 mb-3">account information</h3>
							<p className="text-white/60 leading-relaxed mb-4">
								when you create an account, we collect:
							</p>
							<ul className="list-disc list-inside text-white/60 space-y-2 ml-4">
								<li>email address (for account recovery and notifications)</li>
								<li>hashed authentication credentials (never stored in plain text)</li>
								<li>account creation timestamp</li>
							</ul>

							<h3 className="text-lg text-[#ededed] mt-6 mb-3">encrypted data</h3>
							<p className="text-white/60 leading-relaxed">
								we store your encrypted vault data and shared secrets. this data is encrypted before it reaches our servers and we cannot decrypt it.
							</p>

							<h3 className="text-lg text-[#ededed] mt-6 mb-3">usage data</h3>
							<p className="text-white/60 leading-relaxed mb-4">
								we collect minimal, anonymized usage data:
							</p>
							<ul className="list-disc list-inside text-white/60 space-y-2 ml-4">
								<li>aggregate feature usage statistics (not tied to accounts)</li>
								<li>error logs for debugging (stripped of personal information)</li>
								<li>performance metrics</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">information we do not collect</h2>
							<ul className="list-disc list-inside text-white/60 space-y-2 ml-4">
								<li>your master password or secret key</li>
								<li>unencrypted contents of your vault or shared secrets</li>
								<li>ip addresses (beyond what's needed for rate limiting)</li>
								<li>tracking cookies or advertising identifiers</li>
								<li>browsing history outside of noro</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">how we use your information</h2>
							<p className="text-white/60 leading-relaxed mb-4">
								we use collected information to:
							</p>
							<ul className="list-disc list-inside text-white/60 space-y-2 ml-4">
								<li>provide and maintain the service</li>
								<li>authenticate your identity</li>
								<li>send essential account notifications</li>
								<li>improve service reliability and performance</li>
								<li>comply with legal obligations</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">data sharing</h2>
							<p className="text-white/60 leading-relaxed mb-4">
								we do not sell, rent, or trade your personal information. we may share data only in these circumstances:
							</p>
							<ul className="list-disc list-inside text-white/60 space-y-2 ml-4">
								<li>with service providers who help operate noro (under strict confidentiality agreements)</li>
								<li>when required by law (but we can only provide encrypted data)</li>
								<li>to protect the rights and safety of users and the public</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">data retention</h2>
							<ul className="list-disc list-inside text-white/60 space-y-2 ml-4">
								<li>shared secrets: automatically deleted after expiration or view limit</li>
								<li>vault data: retained until you delete your account</li>
								<li>account information: deleted within 30 days of account deletion</li>
								<li>anonymized analytics: retained indefinitely for service improvement</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">your rights</h2>
							<p className="text-white/60 leading-relaxed mb-4">
								you have the right to:
							</p>
							<ul className="list-disc list-inside text-white/60 space-y-2 ml-4">
								<li>access your account information</li>
								<li>export your encrypted vault data</li>
								<li>delete your account and all associated data</li>
								<li>opt out of non-essential communications</li>
								<li>request information about how your data is used</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">security measures</h2>
							<p className="text-white/60 leading-relaxed mb-4">
								we implement comprehensive security measures:
							</p>
							<ul className="list-disc list-inside text-white/60 space-y-2 ml-4">
								<li>all data transmitted over TLS 1.3</li>
								<li>infrastructure hosted on SOC 2 compliant providers</li>
								<li>regular security audits and penetration testing</li>
								<li>encrypted backups with geographic redundancy</li>
								<li>strict access controls for employees</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">cookies</h2>
							<p className="text-white/60 leading-relaxed">
								we use only essential cookies required for authentication and session management. we do not use tracking cookies, analytics cookies, or advertising cookies.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">children's privacy</h2>
							<p className="text-white/60 leading-relaxed">
								noro is not intended for users under 16 years of age. we do not knowingly collect information from children.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">international transfers</h2>
							<p className="text-white/60 leading-relaxed">
								your encrypted data may be processed in countries other than your own. we ensure appropriate safeguards are in place for any international data transfers.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">changes to this policy</h2>
							<p className="text-white/60 leading-relaxed">
								we may update this privacy policy from time to time. we will notify you of material changes via email or through the service. the "last updated" date at the top indicates when the policy was last revised.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">contact us</h2>
							<p className="text-white/60 leading-relaxed">
								for privacy-related questions or concerns, contact us at{" "}
								<a href="mailto:privacy@noro.sh" className="text-[#d4b08c] hover:underline">privacy@noro.sh</a>
							</p>
						</section>
					</div>
				</article>
			</main>

			<footer className="px-6 py-12 border-t border-white/5">
				<div className="flex flex-col gap-8 justify-between items-center mx-auto max-w-6xl md:flex-row">
					<Link href="/" className="flex gap-3 items-center opacity-50 transition-opacity hover:opacity-100">
						<Logo />
						<span className="font-mono text-xs tracking-widest uppercase">Visible / Noro</span>
					</Link>
					<div className="flex gap-8 text-sm text-white/30">
						<Link href="/privacy" className="text-white">Privacy</Link>
						<Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
						<a href="mailto:hello@noro.sh" className="transition-colors hover:text-white">Contact</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
