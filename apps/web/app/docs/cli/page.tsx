import type { Metadata, Viewport } from "next";
import { Header, Section, Code, Prevnext } from "../components";

export const metadata: Metadata = {
	title: "Install",
	description: "install the noro CLI to share secrets from your terminal.",
};

export const viewport: Viewport = {
	themeColor: "#F5F3EF",
};

export default function Install() {
	return (
		<article className="py-8 md:py-12">
			<Header
				section="CLI"
				title="Install"
				description="share secrets from your terminal. no account required."
			/>

			<Section id="npx" title="Run with npx">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					no installation required. run directly with npx:
				</p>
				<Code>npx noro share API_KEY</Code>
			</Section>

			<Section id="global" title="Global install">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					install globally for faster access:
				</p>
				<Code>npm install -g noro</Code>
				<p className="text-sm md:text-base text-black/60 mt-4 md:mt-6 mb-4 md:mb-6 max-w-2xl">
					then use without npx:
				</p>
				<Code>noro share API_KEY</Code>
			</Section>

			<Section id="quickstart" title="Quickstart">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					share a secret and get a one-time link:
				</p>
				<Code>{`# share a single variable
noro share API_KEY

# share multiple variables
noro share API_KEY DATABASE_URL

# share your entire .env file
noro push`}</Code>
				<p className="text-sm md:text-base text-black/60 mt-4 md:mt-6 max-w-2xl">
					the recipient claims with the link. after viewing, it&apos;s permanently deleted.
				</p>
			</Section>

			<Prevnext />
		</article>
	);
}
