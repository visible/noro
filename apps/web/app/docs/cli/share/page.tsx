import type { Metadata, Viewport } from "next";
import { Header, Section, Code, Prevnext } from "../../components";

export const metadata: Metadata = {
	title: "Share",
	description: "share environment variables securely with the noro CLI.",
};

export const viewport: Viewport = {
	themeColor: "#F5F3EF",
};

export default function Share() {
	return (
		<article className="py-8 md:py-12">
			<Header
				section="CLI"
				title="Share"
				description="create one-time links for your environment variables."
			/>

			<Section id="single" title="Single variable">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					share a variable by name. the CLI reads from your environment or .env file:
				</p>
				<Code>noro share API_KEY</Code>
				<p className="text-sm md:text-base text-black/60 mt-4 md:mt-6 max-w-2xl">
					outputs a link like <code className="text-[#C53D43]">noro.sh/x7k#key</code>
				</p>
			</Section>

			<Section id="multiple" title="Multiple variables">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					share several variables at once:
				</p>
				<Code>noro share API_KEY DATABASE_URL SECRET_TOKEN</Code>
				<p className="text-sm md:text-base text-black/60 mt-4 md:mt-6 max-w-2xl">
					all variables are bundled into a single encrypted link.
				</p>
			</Section>

			<Section id="expiry" title="Set expiry">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					control how long the secret stays available:
				</p>
				<Code>noro share API_KEY --ttl=1h</Code>
				<div className="mt-4 md:mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 max-w-xl">
					<div className="p-3 md:p-4 border border-black/10 rounded-xl">
						<code className="text-xs md:text-sm text-[#C53D43]">1h</code>
						<p className="text-black/50 text-xs mt-1">1 hour</p>
					</div>
					<div className="p-3 md:p-4 border border-black/10 rounded-xl">
						<code className="text-xs md:text-sm text-[#C53D43]">6h</code>
						<p className="text-black/50 text-xs mt-1">6 hours</p>
					</div>
					<div className="p-3 md:p-4 border border-black/10 rounded-xl">
						<code className="text-xs md:text-sm text-[#C53D43]">12h</code>
						<p className="text-black/50 text-xs mt-1">12 hours</p>
					</div>
					<div className="p-3 md:p-4 border border-black/10 rounded-xl">
						<code className="text-xs md:text-sm text-[#C53D43]">1d</code>
						<p className="text-black/50 text-xs mt-1">1 day (default)</p>
					</div>
					<div className="p-3 md:p-4 border border-black/10 rounded-xl">
						<code className="text-xs md:text-sm text-[#C53D43]">7d</code>
						<p className="text-black/50 text-xs mt-1">7 days</p>
					</div>
				</div>
			</Section>

			<Section id="source" title="Where values come from">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					the CLI checks these locations in order:
				</p>
				<div className="space-y-2 max-w-xl">
					<div className="flex items-center gap-3 p-3 border border-black/10 rounded-xl">
						<span className="text-xs text-black/40">1</span>
						<span className="text-sm text-black/70">environment variables</span>
					</div>
					<div className="flex items-center gap-3 p-3 border border-black/10 rounded-xl">
						<span className="text-xs text-black/40">2</span>
						<span className="text-sm text-black/70">.env.local in current directory</span>
					</div>
					<div className="flex items-center gap-3 p-3 border border-black/10 rounded-xl">
						<span className="text-xs text-black/40">3</span>
						<span className="text-sm text-black/70">.env in current directory</span>
					</div>
				</div>
			</Section>

			<Prevnext />
		</article>
	);
}
