import type { Metadata, Viewport } from "next";
import { Header, Section, Code, Prevnext } from "../../components";

export const metadata: Metadata = {
	title: "Manage",
	description: "list and revoke your shared secrets.",
};

export const viewport: Viewport = {
	themeColor: "#F5F3EF",
};

export default function Manage() {
	return (
		<article className="py-8 md:py-12">
			<Header
				section="CLI"
				title="Manage"
				description="view and control your active secrets."
			/>

			<Section id="list" title="List secrets">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					see all your active (unexpired, unclaimed) secrets:
				</p>
				<Code>noro list</Code>
				<p className="text-sm md:text-base text-black/60 mt-4 md:mt-6 mb-4 md:mb-6 max-w-2xl">
					shows the secret ID, variables, and time remaining:
				</p>
				<Code>{`$ noro list

  active secrets:

  x7k  API_KEY, DATABASE_URL  expires in 23h
  m9p  SECRET_TOKEN           expires in 6d`}</Code>
			</Section>

			<Section id="revoke" title="Revoke a secret">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					delete a secret before it expires or gets claimed:
				</p>
				<Code>noro revoke x7k</Code>
				<p className="text-sm md:text-base text-black/60 mt-4 md:mt-6 max-w-2xl">
					the secret is immediately and permanently deleted.
				</p>
			</Section>

			<Section id="history" title="Local history">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					your shared secrets are tracked locally in:
				</p>
				<Code>~/.noro/history.json</Code>
				<p className="text-sm md:text-base text-black/60 mt-4 md:mt-6 max-w-2xl">
					this only stores metadata (ID, variable names, expiry). the actual secret values are never stored locally after sharing.
				</p>
			</Section>

			<Prevnext />
		</article>
	);
}
