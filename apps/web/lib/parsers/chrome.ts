import type { NoroParsedItem, ParseResult } from "./types";

interface ChromeRow {
  name?: string;
  url?: string;
  username?: string;
  password?: string;
  note?: string;
}

function parsecsv(data: string): ChromeRow[] {
  const lines = data.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = parsecsvline(lines[0]).map((h) => h.toLowerCase());
  const rows: ChromeRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parsecsvline(lines[i]);
    const row: ChromeRow = {};

    headers.forEach((header, index) => {
      const value = values[index];
      if (value !== undefined) {
        if (header === "name") row.name = value;
        else if (header === "url") row.url = value;
        else if (header === "username") row.username = value;
        else if (header === "password") row.password = value;
        else if (header === "note") row.note = value;
      }
    });

    rows.push(row);
  }

  return rows;
}

function parsecsvline(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inquotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inquotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inquotes = !inquotes;
      }
    } else if (char === "," && !inquotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function extractdomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function parserow(row: ChromeRow): NoroParsedItem | null {
  if (!row.url && !row.username && !row.password) {
    return null;
  }

  const name = row.name || (row.url ? extractdomain(row.url) : "untitled");

  return {
    type: "login",
    name,
    username: row.username,
    password: row.password,
    url: row.url,
    notes: row.note,
  };
}

export function parse(data: string): ParseResult {
  const items: NoroParsedItem[] = [];
  const errors: string[] = [];

  try {
    const rows = parsecsv(data);

    for (let i = 0; i < rows.length; i++) {
      try {
        const parsed = parserow(rows[i]);
        if (parsed) {
          items.push(parsed);
        }
      } catch {
        errors.push(`failed to parse row ${i + 1}`);
      }
    }
  } catch {
    errors.push("invalid chrome export format");
  }

  return { items, errors };
}
