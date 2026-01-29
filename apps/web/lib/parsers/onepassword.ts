import type { NoroParsedItem, ParseResult } from "./types";

interface OnePasswordField {
  designation?: string;
  name?: string;
  value?: string;
  type?: string;
}

interface OnePasswordSection {
  title?: string;
  fields?: OnePasswordField[];
}

interface OnePasswordItem {
  uuid: string;
  typeName: string;
  title?: string;
  secureContents?: {
    username?: string;
    password?: string;
    notesPlain?: string;
    URLs?: { url: string }[];
    fields?: OnePasswordField[];
    sections?: OnePasswordSection[];
    cardholder?: string;
    ccnum?: string;
    expiry?: string;
    cvv?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    address1?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  overview?: {
    title?: string;
    url?: string;
  };
}

interface OnePasswordExport {
  accounts?: {
    vaults?: {
      items?: OnePasswordItem[];
    }[];
  }[];
}

function findfield(fields: OnePasswordField[] | undefined, key: string): string | undefined {
  if (!fields) return undefined;
  const field = fields.find(
    (f) => f.designation === key || f.name === key || f.type === key
  );
  return field?.value;
}

function parseitem(item: OnePasswordItem): NoroParsedItem | null {
  const name = item.overview?.title || item.title || "untitled";
  const contents = item.secureContents || {};

  switch (item.typeName) {
    case "webforms.WebForm":
    case "passwords.Password":
    case "wallet.onlineservices.GenericAccount": {
      const username =
        contents.username ||
        findfield(contents.fields, "username") ||
        findfield(contents.fields, "email");
      const password =
        contents.password || findfield(contents.fields, "password");
      const url =
        item.overview?.url || contents.URLs?.[0]?.url;
      return {
        type: "login",
        name,
        username,
        password,
        url,
        notes: contents.notesPlain,
        totp: findfield(contents.fields, "TOTP"),
      };
    }

    case "securenotes.SecureNote":
      return {
        type: "note",
        name,
        notes: contents.notesPlain || "",
      };

    case "wallet.financial.CreditCard":
      return {
        type: "card",
        name,
        cardholder: contents.cardholder,
        number: contents.ccnum,
        expiry: contents.expiry,
        cvv: contents.cvv,
        notes: contents.notesPlain,
      };

    case "identities.Identity":
      return {
        type: "identity",
        name,
        firstname: contents.firstname,
        lastname: contents.lastname,
        email: contents.email,
        phone: contents.phone,
        address: contents.address1,
        city: contents.city,
        state: contents.state,
        zip: contents.zip,
        country: contents.country,
        notes: contents.notesPlain,
      };

    default:
      if (contents.password || contents.username) {
        return {
          type: "login",
          name,
          username: contents.username,
          password: contents.password,
          url: item.overview?.url,
          notes: contents.notesPlain,
        };
      }
      if (contents.notesPlain) {
        return {
          type: "note",
          name,
          notes: contents.notesPlain,
        };
      }
      return null;
  }
}

export function parse(data: string): ParseResult {
  const items: NoroParsedItem[] = [];
  const errors: string[] = [];

  try {
    const exported: OnePasswordExport = JSON.parse(data);
    const accounts = exported.accounts || [];

    for (const account of accounts) {
      const vaults = account.vaults || [];
      for (const vault of vaults) {
        const vaultitems = vault.items || [];
        for (const item of vaultitems) {
          try {
            const parsed = parseitem(item);
            if (parsed) {
              items.push(parsed);
            }
          } catch {
            errors.push(`failed to parse item: ${item.uuid}`);
          }
        }
      }
    }
  } catch {
    errors.push("invalid 1password export format");
  }

  return { items, errors };
}
