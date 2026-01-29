import type { ItemType } from "../../../stores";

export const colors = {
  bg: "#0a0a0a",
  surface: "#141414",
  border: "#1f1f1f",
  accent: "#d4b08c",
  text: "#ffffff",
  muted: "#666666",
  error: "#ef4444",
} as const;

export const typeColors: Record<ItemType, string> = {
  login: "#3b82f6",
  note: "#a855f7",
  card: "#22c55e",
  identity: "#f59e0b",
  ssh: "#06b6d4",
  api: "#ec4899",
  otp: "#8b5cf6",
  passkey: "#14b8a6",
} as const;
