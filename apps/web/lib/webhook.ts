import { Client } from "@upstash/qstash";

const qstash = process.env.QSTASH_TOKEN
  ? new Client({ token: process.env.QSTASH_TOKEN })
  : null;

export type WebhookEvent = "secret.created" | "secret.viewed" | "secret.expired";

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: number;
  data: {
    id: string;
  };
}

export async function send(url: string, event: WebhookEvent, id: string): Promise<void> {
  if (!qstash) {
    return;
  }
  const timestamp = Date.now();
  const payload: WebhookPayload = {
    event,
    timestamp,
    data: { id },
  };
  const body = JSON.stringify(payload);
  const signature = await sign(timestamp, body);
  await qstash.publishJSON({
    url,
    body: payload,
    headers: {
      "x-noro-signature": `t=${timestamp},v1=${signature}`,
    },
  });
}

async function sign(timestamp: number, body: string): Promise<string> {
  const secret = process.env.WEBHOOK_SECRET || "default";
  const encoder = new TextEncoder();
  const message = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
