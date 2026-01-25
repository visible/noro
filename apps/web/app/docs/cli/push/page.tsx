import type { Metadata, Viewport } from "next";
import { Header, Section, Code, Prevnext } from "../../components";

export const metadata: Metadata = {
	title: "Push",
	description: "share your entire .env file with a single command.",
};

export const viewport: Viewport = {
	themeColor: "#F5F3EF",
};

export default function Push() {
	return (
		<article className="py-8 md:py-12">
			<Header
				section="CLI"
				title="Push"
				description="share all variables from your .env file at once."
			/>

			<Section id="basic" title="Push .env">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					share everything in your .env file with one command:
				</p>
				<Code>noro push</Code>
				<p className="text-sm md:text-base text-black/60 mt-4 md:mt-6 max-w-2xl">
					all variables are encrypted together into a single link.
				</p>
			</Section>

			<Section id="source" title="Source file">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					the CLI looks for these files in order:
				</p>
				<div className="space-y-2 max-w-xl">
					<div className="flex items-center gap-3 p-3 border border-black/10 rounded-xl">
						<span className="text-xs text-black/40">1</span>
						<span className="text-sm text-black/70">.env.local</span>
					</div>
					<div className="flex items-center gap-3 p-3 border border-black/10 rounded-xl">
						<span className="text-xs text-black/40">2</span>
						<span className="text-sm text-black/70">.env</span>
					</div>
				</div>
			</Section>

			<Section id="expiry" title="Set expiry">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					control how long the shared env stays available:
				</p>
				<Code>noro push --ttl=1h</Code>
			</Section>

			<Section id="output" title="Output">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					you get a summary of what was shared:
				</p>
				<Code>{`$ noro push

  noro.sh/x7k#key

  or: npx noro x7k#key
  expires: 1d
  variables: API_KEY, DATABASE_URL, SECRET_TOKEN`}</Code>
			</Section>

			<Prevnext />
		</article>
	);
}
