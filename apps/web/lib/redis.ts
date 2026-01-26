import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export interface StoredSecret {
  data: string;
  type: "text" | "file";
  filename?: string;
  mimetype?: string;
  views: number;
  viewed: number;
  peek?: boolean;
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomdelay() {
  return 100 + Math.random() * 200;
}
