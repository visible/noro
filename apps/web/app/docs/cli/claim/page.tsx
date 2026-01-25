import type { Metadata, Viewport } from "next";
import { Header, Section, Code, Prevnext } from "../../components";

export const metadata: Metadata = {
	title: "Claim",
	description: "claim shared secrets and save them to your .env file.",
};

export const viewport: Viewport = {
	themeColor: "#F5F3EF",
};

export default function Claim() {
	return (
		<article className="py-8 md:py-12">
			<Header
				section="CLI"
				title="Claim"
				description="retrieve shared secrets and save them locally."
			/>

			<Section id="basic" title="Claim a secret">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					use the code and key from the shared link:
				</p>
				<Code>noro x7k#key</Code>
				<p className="text-sm md:text-base text-black/60 mt-4 md:mt-6 max-w-2xl">
					the secret is decrypted locally and permanently deleted from the server.
				</p>
			</Section>

			<Section id="picker" title="Interactive picker">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					when claiming multiple variables, choose which ones to save:
				</p>
				<Code>{`◆ select variables to save
│ ◼ API_KEY          sk-12****5678
│ ◼ DATABASE_URL     postgres****
│ ◻ DEBUG            true
└`}</Code>
				<p className="text-sm md:text-base text-black/60 mt-4 md:mt-6 max-w-2xl">
					use arrow keys to navigate, space to toggle, enter to confirm.
				</p>
			</Section>

			<Section id="destination" title="Choose destination">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					select where to save the variables:
				</p>
				<Code>{`◆ save to
│ ○ .env (append)
│ ○ .env.local (append)
│ ○ new file...
│ ○ custom path...
│ ○ copy to clipboard
└`}</Code>
				<p className="text-sm md:text-base text-black/60 mt-4 md:mt-6 max-w-2xl">
					existing variables are updated, new ones are appended.
				</p>
			</Section>

			<Section id="auto" title="Automatic mode">
				<p className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
					for single variables, the CLI automatically saves to your .env file:
				</p>
				<Code>{`$ noro x7k#key
✓ added API_KEY to .env`}</Code>
				<p className="text-sm md:text-base text-black/60 mt-4 md:mt-6 max-w-2xl">
					if no .env file exists, the value is copied to clipboard instead.
				</p>
			</Section>

			<Prevnext />
		</article>
	);
}
