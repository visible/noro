import type { Metadata, Viewport } from "next";
import { Header, Prevnext } from "../../components";
import { Markdown } from "../markdown";
import { readdoc, parsedoc } from "../reader";

export const metadata: Metadata = {
	title: "Share",
	description: "share environment variables securely with the noro CLI.",
};

export const viewport: Viewport = {
	themeColor: "#F5F3EF",
};

export default function Share() {
	const doc = parsedoc(readdoc("share"));

	return (
		<article className="py-8 md:py-12">
			<Header
				section="CLI"
				title={doc.title}
				description={doc.description}
			/>
			<Markdown sections={doc.sections} />
			<Prevnext />
		</article>
	);
}
