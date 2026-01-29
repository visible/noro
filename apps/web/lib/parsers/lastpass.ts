import type { NoroParsedItem, ParseResult } from "./types";

interface LastPassRow {
  url?: string;
  username?: string;
  password?: string;
  totp?: string;
  extra?: string;
  name?: string;
  grouping?: string;
  fav?: string;
}

function parsecsv(data: string): LastPassRow[] {
  const lines = data.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = parsecsvline(lines[0]).map((h) => h.toLowerCase());
  const rows: LastPassRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parsecsvline(lines[i]);
    const row: LastPassRow = {};

    headers.forEach((header, index) => {
      const value = values[index];
      if (value !== undefined) {
        if (header === "url") row.url = value;
        else if (header === "username") row.username = value;
        else if (header === "password") row.password = value;
        else if (header === "totp") row.totp = value;
        else if (header === "extra") row.extra = value;
        else if (header === "name") row.name = value;
        else if (header === "grouping") row.grouping = value;
        else if (header === "fav") row.fav = value;
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

function isnote(row: LastPassRow): boolean {
  return row.url === "http://sn" || row.url === "http://sn/";
}

function parserow(row: LastPassRow): NoroParsedItem | null {
  const name = row.name || row.url || "untitled";

  if (isnote(row)) {
    return {
      type: "note",
      name,
      notes: row.extra || "",
    };
  }

  return {
    type: "login",
    name,
    username: row.username,
    password: row.password,
    url: row.url,
    notes: row.extra,
    totp: row.totp,
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
    errors.push("invalid lastpass export format");
  }

  return { items, errors };
}
