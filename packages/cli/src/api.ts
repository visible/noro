import { getToken, getApiUrl } from "./config.js";

export interface VaultItem {
  id: string;
  name: string;
  type: string;
  vault: string;
  fields: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface Vault {
  id: string;
  name: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  if (!token) {
    throw new Error("not logged in. run: noro login");
  }

  const url = getApiUrl() + "/api/cli" + path;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || response.statusText, response.status);
  }

  return response.json();
}

export async function listVaults(): Promise<Vault[]> {
  return request<Vault[]>("/vaults");
}

export async function listItems(vault?: string): Promise<VaultItem[]> {
  const params = vault ? "?vault=" + encodeURIComponent(vault) : "";
  return request<VaultItem[]>("/items" + params);
}

export async function getItem(id: string): Promise<VaultItem> {
  return request<VaultItem>("/items/" + encodeURIComponent(id));
}

export async function resolveReference(ref: string): Promise<string> {
  const result = await request<{ value: string }>("/resolve", {
    method: "POST",
    body: JSON.stringify({ ref }),
  });
  return result.value;
}

export async function validateToken(): Promise<boolean> {
  try {
    await request("/me");
    return true;
  } catch {
    return false;
  }
}
