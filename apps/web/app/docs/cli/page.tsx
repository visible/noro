import type { Metadata, Viewport } from "next";
import { Header, Section, Code, Prevnext } from "../components";

export const metadata: Metadata = {
	title: "CLI",
	description: "share secrets from your terminal with the noro CLI.",
};

export const viewport: Viewport = {
	themeColor: "#F5F3EF",
};

export default function CLI() {
	return (
		<article className="py-12">
			<Header
				section="Usage"
				title="CLI"
				description="share secrets from your terminal. reads from environment, writes to .env files."
			/>

			<Section id="install" title="Install">
				<p className="text-black/60 mb-6 max-w-2xl">
					run with npx (no install required):
				</p>
				<Code>npx noro share API_KEY</Code>
			</Section>

			<Section id="share" title="Share a secret">
				<p className="text-black/60 mb-6 max-w-2xl">
					share an environment variable by name. the CLI reads the value from your current environment.
				</p>
				<Code>npx noro share API_KEY</Code>
				<p className="text-black/60 mt-6 mb-6 max-w-2xl">
					share multiple variables at once:
				</p>
				<Code>npx noro share API_KEY DATABASE_URL SECRET_TOKEN</Code>
				<p className="text-black/60 mt-6 max-w-2xl">
					generates a one-time link like <code className="text-[#C53D43]">noro.sh/x7k#key</code>
				</p>
			</Section>

			<Section id="expiry" title="Set expiry">
				<p className="text-black/60 mb-6 max-w-2xl">
					set how long the secret stays available with the <code className="text-[#C53D43]">--ttl</code> flag:
				</p>
				<Code>npx noro share API_KEY --ttl=1h</Code>
				<div className="mt-6 grid md:grid-cols-2 gap-4 max-w-xl">
					<div className="p-4 border border-black/10 rounded-xl">
						<code className="text-sm text-[#C53D43]">1h</code>
						<p className="text-black/50 text-xs mt-1">1 hour</p>
					</div>
					<div className="p-4 border border-black/10 rounded-xl">
						<code className="text-sm text-[#C53D43]">6h</code>
						<p className="text-black/50 text-xs mt-1">6 hours</p>
					</div>
					<div className="p-4 border border-black/10 rounded-xl">
						<code className="text-sm text-[#C53D43]">12h</code>
						<p className="text-black/50 text-xs mt-1">12 hours</p>
					</div>
					<div className="p-4 border border-black/10 rounded-xl">
						<code className="text-sm text-[#C53D43]">1d</code>
						<p className="text-black/50 text-xs mt-1">1 day (default)</p>
					</div>
					<div className="p-4 border border-black/10 rounded-xl">
						<code className="text-sm text-[#C53D43]">7d</code>
						<p className="text-black/50 text-xs mt-1">7 days</p>
					</div>
				</div>
			</Section>

			<Section id="claim" title="Claim a secret">
				<p className="text-black/60 mb-6 max-w-2xl">
					claim a secret using just the code and key from the link:
				</p>
				<Code>npx noro x7k#key</Code>
				<p className="text-black/60 mt-6 mb-6 max-w-2xl">
					the CLI automatically writes the secret to <code className="text-[#C53D43]">.env.local</code> or <code className="text-[#C53D43]">.env</code> in your current directory.
				</p>
				<p className="text-black/60 max-w-2xl">
					after claiming, the secret is permanently deleted from our servers.
				</p>
			</Section>

			<Section id="output" title="Output formats">
				<p className="text-black/60 mb-6 max-w-2xl">
					by default, claimed secrets are written to .env files. use flags to change behavior:
				</p>
				<Code>{`# print to stdout instead of writing to file
npx noro x7k#key --stdout

# specify output file
npx noro x7k#key --out=.env.production`}</Code>
			</Section>

			<Prevnext />
		</article>
	);
}
