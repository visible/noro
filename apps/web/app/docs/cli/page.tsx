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
					claim a secret using the code and key from the link:
				</p>
				<Code>npx noro x7k#key</Code>
				<p className="text-black/60 mt-6 mb-6 max-w-2xl">
					when claiming multiple variables, the CLI shows an interactive picker:
				</p>
				<Code>{`◆ select variables to save
│ ◼ API_KEY          sk-12****5678
│ ◼ DATABASE_URL     postgres****
│ ◻ DEBUG            true
└

◆ save to
│ ○ .env (append)
│ ○ .env.local (append)
│ ○ new file...
│ ○ custom path...
│ ○ copy to clipboard
└`}</Code>
				<p className="text-black/60 mt-6 max-w-2xl">
					select which variables you need, choose where to save them. the secret is permanently deleted after claiming.
				</p>
			</Section>

			<Section id="push" title="Push entire .env">
				<p className="text-black/60 mb-6 max-w-2xl">
					share all variables from your .env file at once:
				</p>
				<Code>npx noro push</Code>
				<p className="text-black/60 mt-6 max-w-2xl">
					reads from <code className="text-[#C53D43]">.env.local</code> or <code className="text-[#C53D43]">.env</code> in your current directory.
				</p>
			</Section>

			<Section id="manage" title="Manage secrets">
				<p className="text-black/60 mb-6 max-w-2xl">
					list your active (unexpired) secrets:
				</p>
				<Code>npx noro list</Code>
				<p className="text-black/60 mt-6 mb-6 max-w-2xl">
					revoke a secret before it expires or is claimed:
				</p>
				<Code>npx noro revoke x7k</Code>
			</Section>

			<Prevnext />
		</article>
	);
}
