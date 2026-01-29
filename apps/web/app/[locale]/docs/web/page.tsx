import type { Metadata, Viewport } from "next";
import { Header, Section, Prevnext } from "../components";

export const metadata: Metadata = {
	title: "Web",
	description: "share secrets using the noro website interface.",
};

export const viewport: Viewport = {
	themeColor: "#0a0a0a",
};

export default function Web() {
	return (
		<article className="py-12">
			<Header
				section="Usage"
				title="Web"
				description="share and view secrets using the website. no account required."
			/>

			<Section id="create" title="Create a secret">
				<p className="text-white/60 mb-4 max-w-2xl">
					go to <a href="/share" className="text-[#d4b08c] hover:underline">noro.sh/share</a> and paste your secret.
				</p>
				<p className="text-white/60 mb-4 max-w-2xl">
					choose your options:
				</p>
				<ul className="space-y-2 text-white/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span><strong className="text-[#ededed]">type:</strong> text or file</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span><strong className="text-[#ededed]">expiry:</strong> how long until auto-delete</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span><strong className="text-[#ededed]">views:</strong> how many times it can be viewed (1-5)</span>
					</li>
				</ul>
				<p className="text-white/60 mt-4 max-w-2xl">
					click generate to get your shareable link.
				</p>
			</Section>

			<Section id="files" title="Share files">
				<p className="text-white/60 mb-4 max-w-2xl">
					switch to file mode to upload and share encrypted files. drag and drop or click to select.
				</p>
				<ul className="space-y-2 text-white/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>max file size: 5MB</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>files are encrypted before upload</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>original filename is preserved</span>
					</li>
				</ul>
			</Section>

			<Section id="view" title="View a secret">
				<p className="text-white/60 mb-4 max-w-2xl">
					open the link shared with you. you&apos;ll see a confirmation screen before revealing the secret.
				</p>
				<p className="text-white/60 mb-4 max-w-2xl">
					secrets are hidden by default for screen sharing safety. click to reveal or copy directly.
				</p>
				<p className="text-white/60 max-w-2xl">
					for files, click download to save the decrypted file to your device.
				</p>
			</Section>

			<Section id="privacy" title="Privacy">
				<p className="text-white/60 mb-4 max-w-2xl">
					noro is completely anonymous:
				</p>
				<ul className="space-y-2 text-white/60 max-w-2xl">
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>no account required</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>no tracking or analytics on secret content</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>we never see your decrypted data</span>
					</li>
					<li className="flex items-start gap-2">
						<span className="text-[#d4b08c]">•</span>
						<span>all encryption happens in your browser</span>
					</li>
				</ul>
			</Section>

			<Prevnext />
		</article>
	);
}
