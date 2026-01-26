import type { Metadata, Viewport } from "next";
import { Header, Section, Prevnext } from "../components";

export const metadata: Metadata = {
	title: "Desktop",
	description: "noro desktop app - coming soon.",
};

export const viewport: Viewport = {
	themeColor: "#F5F3EF",
};

export default function Desktop() {
	return (
		<article className="py-12">
			<Header
				section="Coming Soon"
				title="Desktop"
				description="a secure password manager and secret vault. coming soon."
			/>

			<Section id="features" title="Planned features">
				<div className="space-y-8">
					<div>
						<h3 id="password-manager" className="text-xl font-semibold mb-3 text-black">password manager</h3>
						<p className="text-black/60 max-w-2xl">
							store and organize all your passwords securely. encrypted locally with your master password.
						</p>
					</div>
					<div>
						<h3 id="otp" className="text-xl font-semibold mb-3 text-black">OTP authenticator</h3>
						<p className="text-black/60 max-w-2xl">
							built-in two-factor authentication. no need for a separate authenticator app.
						</p>
					</div>
					<div>
						<h3 id="notes" className="text-xl font-semibold mb-3 text-black">encrypted notes</h3>
						<p className="text-black/60 max-w-2xl">
							secure notes for sensitive information like recovery codes, API keys, and credentials.
						</p>
					</div>
					<div>
						<h3 id="autofill" className="text-xl font-semibold mb-3 text-black">auto-fill</h3>
						<p className="text-black/60 max-w-2xl">
							automatically fill passwords in apps and browsers. works system-wide.
						</p>
					</div>
					<div>
						<h3 id="biometric" className="text-xl font-semibold mb-3 text-black">biometric unlock</h3>
						<p className="text-black/60 max-w-2xl">
							unlock with Touch ID, Face ID, or Windows Hello. quick access without typing your master password.
						</p>
					</div>
					<div>
						<h3 id="sync" className="text-xl font-semibold mb-3 text-black">cloud sync</h3>
						<p className="text-black/60 max-w-2xl">
							optional encrypted sync across all your devices. your data is encrypted before leaving your device.
						</p>
					</div>
				</div>
			</Section>

			<Section id="platforms" title="Platforms">
				<ul className="space-y-2 text-black/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>macOS</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>Windows</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>Linux</span>
					</li>
				</ul>
			</Section>

			<Section id="notify" title="Get notified">
				<p className="text-black/60 max-w-2xl">
					follow <a href="https://github.com/visible/noro" className="text-[#C53D43] hover:underline">visible/noro</a> on GitHub to get notified when the desktop app is released.
				</p>
			</Section>

			<Prevnext />
		</article>
	);
}
