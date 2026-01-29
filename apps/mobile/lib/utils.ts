import type { ItemType, VaultItem, LoginData, CardData, ApiData } from "./types";
import { ITEM_TYPES, PASSWORD_CHARS } from "./constants";

export function formatdate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

type PasswordOptions = {
  length?: number;
  lowercase?: boolean;
  uppercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
};

export function generatepassword(options: PasswordOptions = {}): string {
  const {
    length = 16,
    lowercase = true,
    uppercase = true,
    numbers = true,
    symbols = true,
  } = options;

  let chars = "";
  if (lowercase) chars += PASSWORD_CHARS.lowercase;
  if (uppercase) chars += PASSWORD_CHARS.uppercase;
  if (numbers) chars += PASSWORD_CHARS.numbers;
  if (symbols) chars += PASSWORD_CHARS.symbols;

  if (!chars) chars = PASSWORD_CHARS.lowercase + PASSWORD_CHARS.numbers;

  let result = "";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }

  return result;
}

export function maskvalue(value: string, visible = 4): string {
  if (!value) return "";
  if (value.length <= visible) return value;
  const masked = "*".repeat(value.length - visible);
  return masked + value.slice(-visible);
}

export function getitemicon(type: ItemType): string {
  return ITEM_TYPES[type]?.icon || "file";
}

export function getitemsubtitle(item: VaultItem): string {
  switch (item.type) {
    case "login": {
      const data = item.data as LoginData;
      if (data.username) return data.username;
      if (data.url) {
        try {
          return new URL(data.url).hostname;
        } catch {
          return data.url;
        }
      }
      return "";
    }
    case "card": {
      const data = item.data as CardData;
      if (data.number) return `**** ${data.number.slice(-4)}`;
      return "";
    }
    case "api": {
      const data = item.data as ApiData;
      if (data.endpoint) {
        try {
          return new URL(data.endpoint).hostname;
        } catch {
          return data.endpoint;
        }
      }
      return data.key ? maskvalue(data.key, 8) : "";
    }
    case "identity":
      return "Identity document";
    case "ssh":
      return "SSH key";
    case "otp":
      return "One-time password";
    case "passkey":
      return "Passkey credential";
    case "note":
      return "Secure note";
    default:
      return "";
  }
}

export function extractdomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length - 3) + "...";
}
