"use client";

import { Section, Code, Table } from "../components";

const orderedlist = /^\d+\.\s/;
const listitem = /^[-\d.]\s*/;
const inlinecode = /`([^`]+)`/;
const tablerow = /^\|(.+)\|$/;
const tableseparator = /^\|[-:\s|]+\|$/;

interface MarkdownProps {
	sections: {
		id: string;
		title: string;
		content: string;
	}[];
}

function parseTableRow(line: string): string[] {
	return line
		.slice(1, -1)
		.split("|")
		.map((cell) => cell.trim());
}

function parseContent(content: string) {
	const elements: React.ReactNode[] = [];
	const lines = content.trim().split("\n");
	let i = 0;

	while (i < lines.length) {
		const line = lines[i].trimEnd();

		if (line.startsWith("### ")) {
			const heading = line.replace(/^###\s+/, "");
			elements.push(
				<h3 key={`h3-${i}`} className="text-base font-medium text-[#ededed] mt-6 mb-3">
					{heading}
				</h3>
			);
			i++;
			continue;
		}


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


		if (tablerow.test(line) && i + 1 < lines.length && tableseparator.test(lines[i + 1].trimEnd())) {
			const headers = parseTableRow(line);
			i += 2;
			const rows: string[][] = [];
			while (i < lines.length && tablerow.test(lines[i].trimEnd()) && !tableseparator.test(lines[i].trimEnd())) {
				rows.push(parseTableRow(lines[i].trimEnd()));
				i++;
			}
			elements.push(
				<Table key={`table-${i}`} headers={headers} rows={rows} />
			);
			continue;
		}


		if (line.startsWith("- ") || line.startsWith("1. ")) {
			const listItems: string[] = [];
			while (i < lines.length && (lines[i].startsWith("- ") || orderedlist.test(lines[i]))) {
				listItems.push(lines[i].replace(listitem, ""));
				i++;
			}
			const isOrdered = line.startsWith("1.");
			elements.push(
				isOrdered ? (
					<ol key={`list-${i}`} className="space-y-2 max-w-xl my-4">
						{listItems.map((item, idx) => (
							<li key={`${item.slice(0, 20)}-${idx}`} className="flex items-center gap-3 p-3 border border-white/10 rounded-lg bg-white/2">
								<span className="text-xs text-[#d4b08c] font-mono w-5">{idx + 1}.</span>
								<span className="text-sm text-white/70">{parseInline(item)}</span>
							</li>
						))}
					</ol>
				) : (
					<ul key={`list-${i}`} className="space-y-1.5 max-w-xl my-4">
						{listItems.map((item, idx) => (
							<li key={`${item.slice(0, 20)}-${idx}`} className="text-sm text-white/60 flex items-start gap-2">
								<span className="text-[#d4b08c] mt-0.5">•</span>
								<span>{parseInline(item)}</span>
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
			<p key={`p-${i}`} className="text-sm text-white/60 my-3 max-w-2xl leading-relaxed">
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
		const codeMatch = remaining.match(inlinecode);
		if (codeMatch && codeMatch.index !== undefined) {
			if (codeMatch.index > 0) {
				parts.push(remaining.slice(0, codeMatch.index));
			}
			parts.push(
				<code key={key++} className="bg-[#d4b08c]/10 text-[#d4b08c] px-1.5 py-0.5 rounded text-[13px] font-mono">
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
