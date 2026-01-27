import { encrypt } from "@/lib/crypto";

export interface ShareOptions {
  views?: number;
  ttl?: string;
}

export interface ShareResult {
  id: string;
  key: string;
  url: string;
}

export interface VaultItem {
  id: string;
  type: string;
  title: string;
  data: string;
}

function generatekey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function shareitem(
  item: VaultItem,
  options: ShareOptions = {}
): Promise<ShareResult> {
  const key = generatekey();
  const { views = 1, ttl = "1d" } = options;

  const payload = JSON.stringify({
    id: item.id,
    type: item.type,
    title: item.title,
    data: item.data,
  });

  const encrypted = await encrypt(new TextEncoder().encode(payload), key);

  const res = await fetch("/api/store", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: encrypted,
      type: "text",
      views,
      ttl,
    }),
  });

  if (!res.ok) {
    throw new Error("failed to store shared item");
  }

  const { id } = await res.json();
  const url = `${window.location.origin}/${id}#${key}`;

  return { id, key, url };
}

export function getttloptions(): { label: string; value: string }[] {
  return [
    { label: "1 hour", value: "1h" },
    { label: "6 hours", value: "6h" },
    { label: "12 hours", value: "12h" },
    { label: "1 day", value: "1d" },
    { label: "7 days", value: "7d" },
  ];
}

export function getviewoptions(): number[] {
  return [1, 2, 3, 5];
}
