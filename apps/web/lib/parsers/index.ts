export type {
  NoroParsedItem,
  NoroParsedItemType,
  NoroParsedLogin,
  NoroParsedNote,
  NoroParsedCard,
  NoroParsedIdentity,
  ParseResult,
} from "./types";

export { parse as parseonepassword } from "./onepassword";
export { parse as parsebitwarden } from "./bitwarden";
export { parse as parselastpass } from "./lastpass";
export { parse as parsechrome } from "./chrome";

import { parse as parseonepassword } from "./onepassword";
import { parse as parsebitwarden } from "./bitwarden";
import { parse as parselastpass } from "./lastpass";
import { parse as parsechrome } from "./chrome";
import type { ParseResult } from "./types";

export type ParserType = "onepassword" | "bitwarden" | "lastpass" | "chrome";

export function parse(data: string, type: ParserType): ParseResult {
  switch (type) {
    case "onepassword":
      return parseonepassword(data);
    case "bitwarden":
      return parsebitwarden(data);
    case "lastpass":
      return parselastpass(data);
    case "chrome":
      return parsechrome(data);
  }
}

export function detect(data: string): ParserType | null {
  const trimmed = data.trim();

  if (trimmed.startsWith("{")) {
    try {
      const json = JSON.parse(trimmed);

      if (json.accounts && Array.isArray(json.accounts)) {
        return "onepassword";
      }

      if (json.items && Array.isArray(json.items)) {
        const first = json.items[0];
        if (first && typeof first.type === "number") {
          return "bitwarden";
        }
      }
    } catch {
      return null;
    }
  }

  if (trimmed.includes(",")) {
    const firstline = trimmed.split("\n")[0].toLowerCase();

    if (firstline.includes("grouping") || firstline.includes("extra")) {
      return "lastpass";
    }

    if (
      firstline.includes("name") &&
      firstline.includes("url") &&
      firstline.includes("username") &&
      firstline.includes("password")
    ) {
      return "chrome";
    }
  }

  return null;
}
