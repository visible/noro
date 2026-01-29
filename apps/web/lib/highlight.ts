const whitespace = /\s/;
const punctuation = /[{}[\],:\.]/;
const keycolon = /^\s*:/;
const digitstart = /[\d-]/;
const digitbody = /[\d.eE+-]/;

export function isjson(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

interface Token {
  type: "key" | "string" | "number" | "boolean" | "null" | "punctuation";
  value: string;
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    if (whitespace.test(text[i])) {
      let ws = "";
      while (i < text.length && whitespace.test(text[i])) {
        ws += text[i];
        i++;
      }
      tokens.push({ type: "punctuation", value: ws });
      continue;
    }
    if (punctuation.test(text[i])) {
      tokens.push({ type: "punctuation", value: text[i] });
      i++;
      continue;
    }
    if (text[i] === '"') {
      let str = '"';
      i++;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === "\\") {
          str += text[i];
          i++;
        }
        if (i < text.length) {
          str += text[i];
          i++;
        }
      }
      if (i < text.length) {
        str += '"';
        i++;
      }
      const nextnonws = text.slice(i).match(keycolon);
      if (nextnonws) {
        tokens.push({ type: "key", value: str });
      } else {
        tokens.push({ type: "string", value: str });
      }
      continue;
    }
    if (digitstart.test(text[i])) {
      let num = "";
      while (i < text.length && digitbody.test(text[i])) {
        num += text[i];
        i++;
      }
      tokens.push({ type: "number", value: num });
      continue;
    }
    if (text.slice(i, i + 4) === "true") {
      tokens.push({ type: "boolean", value: "true" });
      i += 4;
      continue;
    }
    if (text.slice(i, i + 5) === "false") {
      tokens.push({ type: "boolean", value: "false" });
      i += 5;
      continue;
    }
    if (text.slice(i, i + 4) === "null") {
      tokens.push({ type: "null", value: "null" });
      i += 4;
      continue;
    }
    tokens.push({ type: "punctuation", value: text[i] });
    i++;
  }
  return tokens;
}

const colors: Record<Token["type"], string> = {
  key: "#d4b08c",
  string: "#22c55e",
  number: "#3b82f6",
  boolean: "#a855f7",
  null: "#6b7280",
  punctuation: "#9ca3af",
};

export function highlight(text: string): { html: string; isjson: boolean } {
  if (!isjson(text)) {
    return { html: escapehtml(text), isjson: false };
  }
  const tokens = tokenize(text);
  const html = tokens
    .map(
      (t) =>
        `<span style="color:${colors[t.type]}">${escapehtml(t.value)}</span>`,
    )
    .join("");
  return { html, isjson: true };
}

function escapehtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
