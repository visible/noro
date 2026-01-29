export type User = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

export type Session = {
  token: string;
  expiresAt: Date;
};

export type ItemType =
  | "login"
  | "note"
  | "card"
  | "identity"
  | "ssh"
  | "api"
  | "otp"
  | "passkey";

export type LoginData = {
  username: string;
  password: string;
  url: string;
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
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  company?: string;
  ssn?: string;
  passport?: string;
  license?: string;
  notes?: string;
};

export type SshData = {
  name: string;
  publicKey: string;
  privateKey: string;
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
  algorithm?: "sha1" | "sha256" | "sha512";
  digits?: 6 | 8;
  period?: number;
};

export type PasskeyData = {
  credentialId: string;
  publicKey: string;
  rpId: string;
  userHandle: string;
  counter: number;
  notes?: string;
};

export type ItemData =
  | LoginData
  | NoteData
  | CardData
  | IdentityData
  | SshData
  | ApiData
  | OtpData
  | PasskeyData;

export type VaultItem = {
  id: string;
  type: ItemType;
  title: string;
  data: ItemData;
  favorite: boolean;
  tags: string[];
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  icon: string;
};

export type Tag = {
  id: string;
  name: string;
};

export type FolderIcon =
  | "folder"
  | "star"
  | "archive"
  | "lock"
  | "globe"
  | "code"
  | "key"
  | "user";

export type AutoLockOption = "immediate" | "1min" | "5min" | "15min" | "1hr" | "never";

export type ThemeOption = "light" | "dark" | "system";

export type Preferences = {
  biometric: boolean;
  autofill: boolean;
  autolock: AutoLockOption;
  theme: ThemeOption;
};
