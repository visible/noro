import type { ItemType, AutoLockOption } from "./types";

export const API_URL = "https://noro.sh";

export const STORAGE_KEYS = {
  token: "noro_auth_token",
  vault: "noro_vault_cache",
  settings: "noro_settings",
  vaultkey: "noro_vault_key",
  preferences: "noro_preferences",
  biometric: "noro_biometric",
  lastactive: "noro_last_active",
} as const;

export const ITEM_TYPES: Record<ItemType, { label: string; icon: string }> = {
  login: { label: "Login", icon: "key" },
  note: { label: "Secure Note", icon: "file-text" },
  card: { label: "Card", icon: "credit-card" },
  identity: { label: "Identity", icon: "user" },
  ssh: { label: "SSH Key", icon: "terminal" },
  api: { label: "API Key", icon: "code" },
  otp: { label: "OTP", icon: "clock" },
  passkey: { label: "Passkey", icon: "fingerprint" },
} as const;

export const AUTO_LOCK_OPTIONS: Record<AutoLockOption, { label: string; ms: number }> = {
  immediate: { label: "Immediately", ms: 0 },
  "1min": { label: "1 minute", ms: 60000 },
  "5min": { label: "5 minutes", ms: 300000 },
  "15min": { label: "15 minutes", ms: 900000 },
  "1hr": { label: "1 hour", ms: 3600000 },
  never: { label: "Never", ms: -1 },
} as const;

export const FOLDER_ICONS = [
  "folder",
  "star",
  "archive",
  "lock",
  "globe",
  "code",
  "key",
  "user",
] as const;

export const PASSWORD_CHARS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
} as const;
