import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";

export const metadata = {
	title: "terms of service - noro",
	description: "terms of service for noro",
};

export default function Terms() {
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
						<Link href="/privacy" className="text-sm font-medium text-white/60 hover:text-[#d4b08c] transition-colors">Privacy</Link>
						<Link href="/terms" className="text-sm font-medium text-white hover:text-[#d4b08c] transition-colors">Terms</Link>
					</div>
					<div className="md:hidden">
						<div className="w-8 h-8 rounded-full bg-white/10"></div>
					</div>
				</div>
			</nav>

			<main className="px-6 py-16 relative z-10">
				<article className="mx-auto max-w-6xl">
					<header className="mb-16">
						<h1 className="font-serif text-4xl sm:text-5xl text-[#ededed] mb-4">terms of service</h1>
						<p className="text-white/40 text-sm">last updated: january 28, 2026</p>
					</header>

					<div className="prose prose-invert prose-sm max-w-none space-y-12">
						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">1. acceptance of terms</h2>
							<p className="text-white/60 leading-relaxed">
								by accessing or using noro ("the service"), you agree to be bound by these terms of service. if you do not agree to these terms, do not use the service.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">2. description of service</h2>
							<p className="text-white/60 leading-relaxed mb-4">
								noro provides end-to-end encrypted secret sharing and password management services. the service includes:
							</p>
							<ul className="list-disc list-inside text-white/60 space-y-2 ml-4">
								<li>one-time secret sharing with automatic expiration</li>
								<li>encrypted password vault storage</li>
								<li>browser extension and desktop applications</li>
								<li>command-line interface tools</li>
								<li>api access for developers</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">3. user accounts</h2>
							<p className="text-white/60 leading-relaxed mb-4">
								you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. you agree to:
							</p>
							<ul className="list-disc list-inside text-white/60 space-y-2 ml-4">
								<li>provide accurate and complete registration information</li>
								<li>maintain the security of your password and secret key</li>
								<li>notify us immediately of any unauthorized use</li>
								<li>accept responsibility for all activities under your account</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">4. zero-knowledge architecture</h2>
							<p className="text-white/60 leading-relaxed">
								noro operates on a zero-knowledge basis. your secrets and vault contents are encrypted client-side before transmission to our servers. we cannot access, read, or recover your encrypted data. you are solely responsible for maintaining access to your master password and secret key. lost credentials cannot be recovered.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">5. acceptable use</h2>
							<p className="text-white/60 leading-relaxed mb-4">
								you agree not to use the service to:
							</p>
							<ul className="list-disc list-inside text-white/60 space-y-2 ml-4">
								<li>share illegal content or facilitate illegal activities</li>
								<li>distribute malware, viruses, or harmful code</li>
								<li>violate any applicable laws or regulations</li>
								<li>infringe on intellectual property rights</li>
								<li>harass, abuse, or harm others</li>
								<li>attempt to gain unauthorized access to our systems</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">6. data retention</h2>
							<p className="text-white/60 leading-relaxed">
								shared secrets are automatically deleted after their expiration time or view limit is reached. vault data is retained until you delete your account. we may retain anonymized usage statistics for service improvement.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">7. service availability</h2>
							<p className="text-white/60 leading-relaxed">
								we strive to maintain high availability but do not guarantee uninterrupted access to the service. we may modify, suspend, or discontinue any aspect of the service at any time with reasonable notice when possible.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">8. limitation of liability</h2>
							<p className="text-white/60 leading-relaxed">
								the service is provided "as is" without warranties of any kind. we are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service. our total liability shall not exceed the amount you paid us in the twelve months preceding the claim.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">9. termination</h2>
							<p className="text-white/60 leading-relaxed">
								you may terminate your account at any time through the settings page. we may terminate or suspend your access for violations of these terms. upon termination, your encrypted data will be permanently deleted.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">10. changes to terms</h2>
							<p className="text-white/60 leading-relaxed">
								we may update these terms from time to time. we will notify you of material changes via email or through the service. continued use after changes constitutes acceptance of the new terms.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-serif text-[#ededed] mb-4">11. contact</h2>
							<p className="text-white/60 leading-relaxed">
								for questions about these terms, contact us at{" "}
								<a href="mailto:legal@noro.sh" className="text-[#d4b08c] hover:underline">legal@noro.sh</a>
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
						<Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
						<Link href="/terms" className="text-white">Terms</Link>
						<a href="mailto:hello@noro.sh" className="transition-colors hover:text-white">Contact</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
