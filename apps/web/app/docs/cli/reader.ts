import { readFileSync } from "fs";
import { join } from "path";

const docsPath = join(process.cwd(), "..", "..", "packages", "cli", "docs");
const whitespace = /\s+/g;

export function readdoc(name: string): string {
	return readFileSync(join(docsPath, `${name}.md`), "utf-8");
}

interface Section {
	id: string;
	title: string;
	content: string;
}

interface ParsedDoc {
	title: string;
	description: string;
	sections: Section[];
}

export function parsedoc(markdown: string): ParsedDoc {
	const lines = markdown.split("\n");
	const title = lines[0].replace(/^#\s+/, "");
	const description = lines[2] || "";

	const sections: Section[] = [];
	let current: Section | null = null;

	for (let i = 4; i < lines.length; i++) {
		const line = lines[i];
		if (line.startsWith("## ")) {
			if (current) sections.push(current);
			const sectionTitle = line.replace(/^##\s+/, "");
			current = {
				id: sectionTitle.toLowerCase().replace(whitespace, "-"),
				title: sectionTitle,
				content: "",
			};
		} else if (current) {
			current.content += line + "\n";
		}
	}
	if (current) sections.push(current);

	return { title, description, sections };
}
