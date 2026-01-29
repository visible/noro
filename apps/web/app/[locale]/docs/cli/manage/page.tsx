import type { Metadata, Viewport } from "next";
import { Header, Prevnext } from "../../components";
import { Markdown } from "../markdown";
import { readdoc, parsedoc } from "../reader";

export const metadata: Metadata = {
	title: "Manage",
	description: "list and revoke your shared secrets.",
};

export const viewport: Viewport = {
	themeColor: "#0a0a0a",
};

export default function Manage() {
	const doc = parsedoc(readdoc("manage"));

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
