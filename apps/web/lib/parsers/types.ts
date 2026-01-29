export type NoroParsedItemType = "login" | "note" | "card" | "identity";

export interface NoroParsedLogin {
  type: "login";
  name: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  totp?: string;
}

export interface NoroParsedNote {
  type: "note";
  name: string;
  notes: string;
}

export interface NoroParsedCard {
  type: "card";
  name: string;
  cardholder?: string;
  number?: string;
  expiry?: string;
  cvv?: string;
  notes?: string;
}

export interface NoroParsedIdentity {
  type: "identity";
  name: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
}

export type NoroParsedItem =
  | NoroParsedLogin
  | NoroParsedNote
  | NoroParsedCard
  | NoroParsedIdentity;

export interface ParseResult {
  items: NoroParsedItem[];
  errors: string[];
}
