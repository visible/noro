import type { NoroParsedItem, ParseResult } from "./types";

interface BitwardenLogin {
  username?: string;
  password?: string;
  totp?: string;
  uris?: { uri: string }[];
}

interface BitwardenCard {
  cardholderName?: string;
  number?: string;
  expMonth?: string;
  expYear?: string;
  code?: string;
}

interface BitwardenIdentity {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface BitwardenItem {
  id: string;
  name: string;
  type: number;
  notes?: string;
  login?: BitwardenLogin;
  card?: BitwardenCard;
  identity?: BitwardenIdentity;
}

interface BitwardenExport {
  items?: BitwardenItem[];
}

function formatexpiry(month?: string, year?: string): string | undefined {
  if (!month && !year) return undefined;
  const m = month?.padStart(2, "0") || "01";
  const y = year || "";
  return `${m}/${y}`;
}

function parseitem(item: BitwardenItem): NoroParsedItem | null {
  const name = item.name || "untitled";

  switch (item.type) {
    case 1: {
      const login = item.login || {};
      return {
        type: "login",
        name,
        username: login.username,
        password: login.password,
        url: login.uris?.[0]?.uri,
        notes: item.notes,
        totp: login.totp,
      };
    }

    case 2:
      return {
        type: "note",
        name,
        notes: item.notes || "",
      };

    case 3: {
      const card = item.card || {};
      return {
        type: "card",
        name,
        cardholder: card.cardholderName,
        number: card.number,
        expiry: formatexpiry(card.expMonth, card.expYear),
        cvv: card.code,
        notes: item.notes,
      };
    }

    case 4: {
      const identity = item.identity || {};
      return {
        type: "identity",
        name,
        firstname: identity.firstName,
        lastname: identity.lastName,
        email: identity.email,
        phone: identity.phone,
        address: identity.address1,
        city: identity.city,
        state: identity.state,
        zip: identity.postalCode,
        country: identity.country,
        notes: item.notes,
      };
    }

    default:
      return null;
  }
}

export function parse(data: string): ParseResult {
  const items: NoroParsedItem[] = [];
  const errors: string[] = [];

  try {
    const exported: BitwardenExport = JSON.parse(data);
    const bitwardenitems = exported.items || [];

    for (const item of bitwardenitems) {
      try {
        const parsed = parseitem(item);
        if (parsed) {
          items.push(parsed);
        }
      } catch {
        errors.push(`failed to parse item: ${item.id}`);
      }
    }
  } catch {
    errors.push("invalid bitwarden export format");
  }

  return { items, errors };
}
