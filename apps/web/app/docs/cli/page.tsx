import type { Metadata, Viewport } from "next";
import { Header, Prevnext } from "../components";
import { Markdown } from "./markdown";
import { readdoc, parsedoc } from "./reader";

export const metadata: Metadata = {
	title: "Install",
	description: "install the noro CLI to share secrets from your terminal.",
};

export const viewport: Viewport = {
	themeColor: "#F5F3EF",
};

export default function Install() {
	const doc = parsedoc(readdoc("install"));

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
