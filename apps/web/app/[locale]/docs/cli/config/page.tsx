import type { Metadata, Viewport } from "next";
import { Header, Prevnext } from "../../components";
import { Markdown } from "../markdown";
import { readdoc, parsedoc } from "../reader";

export const metadata: Metadata = {
	title: "Config",
	description: "set default options for the noro CLI.",
};

export const viewport: Viewport = {
	themeColor: "#0a0a0a",
};

export default function Config() {
	const doc = parsedoc(readdoc("config"));

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
