"use client";

import { Section, Code } from "../components";

interface MarkdownProps {
	sections: {
		id: string;
		title: string;
		content: string;
	}[];
}

function parseContent(content: string) {
	const elements: React.ReactNode[] = [];
	const lines = content.trim().split("\n");
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		if (line.startsWith("```")) {
			const codeLines: string[] = [];
			i++;
			while (i < lines.length && !lines[i].startsWith("```")) {
				codeLines.push(lines[i]);
				i++;
			}
			elements.push(
				<Code key={`code-${i}`}>{codeLines.join("\n")}</Code>
			);
			i++;
			continue;
		}

		if (line.startsWith("- ") || line.startsWith("1. ")) {
			const listItems: string[] = [];
			while (i < lines.length && (lines[i].startsWith("- ") || /^\d+\.\s/.test(lines[i]))) {
				listItems.push(lines[i].replace(/^[-\d.]\s*/, ""));
				i++;
			}
			const isOrdered = line.startsWith("1.");
			elements.push(
				isOrdered ? (
					<ol key={`list-${i}`} className="space-y-2 max-w-xl mb-4">
						{listItems.map((item, idx) => (
							<li key={idx} className="flex items-center gap-3 p-3 border border-black/10 rounded-xl">
								<span className="text-xs text-black/40">{idx + 1}</span>
								<span className="text-sm text-black/70">{item}</span>
							</li>
						))}
					</ol>
				) : (
					<ul key={`list-${i}`} className="space-y-1 max-w-xl mb-4">
						{listItems.map((item, idx) => (
							<li key={idx} className="text-sm md:text-base text-black/60 flex items-start gap-2">
								<span className="text-black/30 mt-1">•</span>
								{parseInline(item)}
							</li>
						))}
					</ul>
				)
			);
			continue;
		}

		if (line.trim() === "") {
			i++;
			continue;
		}

		elements.push(
			<p key={`p-${i}`} className="text-sm md:text-base text-black/60 mb-4 md:mb-6 max-w-2xl">
				{parseInline(line)}
			</p>
		);
		i++;
	}

	return elements;
}

function parseInline(text: string): React.ReactNode {
	const parts: React.ReactNode[] = [];
	let remaining = text;
	let key = 0;

	while (remaining.length > 0) {
		const codeMatch = remaining.match(/`([^`]+)`/);
		if (codeMatch && codeMatch.index !== undefined) {
			if (codeMatch.index > 0) {
				parts.push(remaining.slice(0, codeMatch.index));
			}
			parts.push(
				<code key={key++} className="bg-[#C53D43]/10 text-[#C53D43] px-1.5 py-0.5 rounded text-sm font-mono">
					{codeMatch[1]}
				</code>
			);
			remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
		} else {
			parts.push(remaining);
			break;
		}
	}

	return parts;
}

export function Markdown({ sections }: MarkdownProps) {
	return (
		<>
			{sections.map((section) => (
				<Section key={section.id} id={section.id} title={section.title}>
					{parseContent(section.content)}
				</Section>
			))}
		</>
	);
}
