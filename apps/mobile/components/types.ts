export type ItemType = "login" | "note" | "card" | "identity" | "ssh" | "api" | "otp" | "passkey";

export type LoginData = {
  username?: string;
  password?: string;
  url?: string;
  totp?: string;
  notes?: string;
};

export type NoteData = {
  content: string;
};

export type CardData = {
  holder: string;
  number: string;
  expiry: string;
  cvv: string;
  pin?: string;
  notes?: string;
};

export type IdentityData = {
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
};

export type SshData = {
  privatekey: string;
  publickey?: string;
  passphrase?: string;
  notes?: string;
};

export type ApiData = {
  key: string;
  secret?: string;
  endpoint?: string;
  notes?: string;
};

export type OtpData = {
  secret: string;
  issuer?: string;
  account?: string;
  digits?: number;
  period?: number;
};

export type PasskeyData = {
  credentialid: string;
  publickey: string;
  rpid: string;
  origin: string;
  notes?: string;
};

export type ItemDataMap = {
  login: LoginData;
  note: NoteData;
  card: CardData;
  identity: IdentityData;
  ssh: SshData;
  api: ApiData;
  otp: OtpData;
  passkey: PasskeyData;
};

export type VaultItem = {
  id: string;
  type: ItemType;
  title: string;
  data: ItemDataMap[ItemType];
  tags: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "password" | "textarea" | "url" | "email" | "number";
  required?: boolean;
  half?: boolean;
};

export const fieldConfigs: Record<ItemType, FieldConfig[]> = {
  login: [
    { name: "username", label: "username", type: "text" },
    { name: "password", label: "password", type: "password", required: true },
    { name: "url", label: "website url", type: "url" },
    { name: "totp", label: "totp secret", type: "password" },
    { name: "notes", label: "notes", type: "textarea" },
  ],
  note: [{ name: "content", label: "content", type: "textarea", required: true }],
  card: [
    { name: "holder", label: "cardholder name", type: "text", required: true },
    { name: "number", label: "card number", type: "password", required: true },
    { name: "expiry", label: "expiry (mm/yy)", type: "text", required: true, half: true },
    { name: "cvv", label: "cvv", type: "password", required: true, half: true },
    { name: "pin", label: "pin", type: "password" },
    { name: "notes", label: "notes", type: "textarea" },
  ],
  identity: [
    { name: "firstname", label: "first name", type: "text", half: true },
    { name: "lastname", label: "last name", type: "text", half: true },
    { name: "email", label: "email", type: "email" },
    { name: "phone", label: "phone", type: "text" },
    { name: "address", label: "address", type: "text" },
    { name: "city", label: "city", type: "text", half: true },
    { name: "state", label: "state", type: "text", half: true },
    { name: "zip", label: "zip code", type: "text", half: true },
    { name: "country", label: "country", type: "text", half: true },
    { name: "notes", label: "notes", type: "textarea" },
  ],
  ssh: [
    { name: "privatekey", label: "private key", type: "textarea", required: true },
    { name: "publickey", label: "public key", type: "textarea" },
    { name: "passphrase", label: "passphrase", type: "password" },
    { name: "notes", label: "notes", type: "textarea" },
  ],
  api: [
    { name: "key", label: "api key", type: "password", required: true },
    { name: "secret", label: "api secret", type: "password" },
    { name: "endpoint", label: "endpoint url", type: "url" },
    { name: "notes", label: "notes", type: "textarea" },
  ],
  otp: [
    { name: "secret", label: "secret", type: "password", required: true },
    { name: "issuer", label: "issuer", type: "text", half: true },
    { name: "account", label: "account", type: "text", half: true },
    { name: "digits", label: "digits", type: "number", half: true },
    { name: "period", label: "period (seconds)", type: "number", half: true },
  ],
  passkey: [
    { name: "credentialid", label: "credential id", type: "text", required: true },
    { name: "publickey", label: "public key", type: "textarea", required: true },
    { name: "rpid", label: "relying party id", type: "text", required: true },
    { name: "origin", label: "origin", type: "url", required: true },
    { name: "notes", label: "notes", type: "textarea" },
  ],
};

export const typeLabels: Record<ItemType, string> = {
  login: "logins",
  note: "notes",
  card: "cards",
  identity: "identities",
  ssh: "ssh keys",
  api: "api keys",
  otp: "otp codes",
  passkey: "passkeys",
};
