import type { Metadata, Viewport } from "next";
import { Header, Section, Prevnext } from "../components";

export const metadata: Metadata = {
	title: "Extension",
	description: "noro browser extension - coming soon.",
};

export const viewport: Viewport = {
	themeColor: "#F5F3EF",
};

export default function Extension() {
	return (
		<article className="py-12">
			<Header
				section="Coming Soon"
				title="Extension"
				description="browser extension for password auto-fill and OTP. coming soon."
			/>

			<Section id="features" title="Planned features">
				<div className="space-y-8">
					<div>
						<h3 id="autofill" className="text-xl font-semibold mb-3 text-black">auto-fill</h3>
						<p className="text-black/60 max-w-2xl">
							automatically fill passwords and login forms. works on any website.
						</p>
					</div>
					<div>
						<h3 id="generate" className="text-xl font-semibold mb-3 text-black">password generator</h3>
						<p className="text-black/60 max-w-2xl">
							generate strong, unique passwords for every site. customize length and character types.
						</p>
					</div>
					<div>
						<h3 id="otp" className="text-xl font-semibold mb-3 text-black">OTP auto-fill</h3>
						<p className="text-black/60 max-w-2xl">
							automatically fill two-factor codes. no need to switch apps or type codes manually.
						</p>
					</div>
					<div>
						<h3 id="save" className="text-xl font-semibold mb-3 text-black">auto-save</h3>
						<p className="text-black/60 max-w-2xl">
							automatically capture new logins when you sign up for sites.
						</p>
					</div>
				</div>
			</Section>

			<Section id="sync" title="Sync with desktop">
				<p className="text-black/60 mb-4 max-w-2xl">
					the extension syncs with the noro desktop app:
				</p>
				<ul className="space-y-2 text-black/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>all passwords available in your browser</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>changes sync instantly across devices</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>works on mobile browsers too</span>
					</li>
				</ul>
			</Section>

			<Section id="browsers" title="Supported browsers">
				<ul className="space-y-2 text-black/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>Chrome</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>Firefox</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>Safari</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>Edge</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>Brave</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#C53D43]">•</span>
						<span>Arc</span>
					</li>
				</ul>
			</Section>

			<Section id="notify" title="Get notified">
				<p className="text-black/60 max-w-2xl">
					follow <a href="https://github.com/visible/noro" className="text-[#C53D43] hover:underline">visible/noro</a> on GitHub to get notified when the browser extension is released.
				</p>
			</Section>

			<Prevnext />
		</article>
	);
}
