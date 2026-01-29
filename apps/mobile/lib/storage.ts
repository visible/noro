import * as SecureStore from "expo-secure-store";

const KEYS = {
  token: "noro_auth_token",
  vault: "noro_vault_cache",
  preferences: "noro_preferences",
  vaultkey: "noro_vault_key",
} as const;

type StorageKey = keyof typeof KEYS;

export type Preferences = {
  biometric: boolean;
  autofill: boolean;
  timeout: number;
  theme: "light" | "dark" | "system";
};

const defaults: Preferences = {
  biometric: false,
  autofill: true,
  timeout: 300,
  theme: "system",
};

async function get(key: StorageKey): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEYS[key]);
  } catch {
    return null;
  }
}

async function set(key: StorageKey, value: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(KEYS[key], value);
    return true;
  } catch {
    return false;
  }
}

async function remove(key: StorageKey): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(KEYS[key]);
    return true;
  } catch {
    return false;
  }
}

export async function gettoken(): Promise<string | null> {
  return get("token");
}

export async function settoken(token: string): Promise<boolean> {
  return set("token", token);
}

export async function cleartoken(): Promise<boolean> {
  return remove("token");
}

export async function getvaultcache(): Promise<string | null> {
  return get("vault");
}

export async function setvaultcache(data: string): Promise<boolean> {
  return set("vault", data);
}

export async function clearvaultcache(): Promise<boolean> {
  return remove("vault");
}

export async function getvaultkey(): Promise<string | null> {
  return get("vaultkey");
}

export async function setvaultkey(key: string): Promise<boolean> {
  return set("vaultkey", key);
}

export async function clearvaultkey(): Promise<boolean> {
  return remove("vaultkey");
}

export async function getpreferences(): Promise<Preferences> {
  const raw = await get("preferences");
  if (!raw) return defaults;
  try {
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export async function setpreferences(prefs: Partial<Preferences>): Promise<boolean> {
  const current = await getpreferences();
  const merged = { ...current, ...prefs };
  return set("preferences", JSON.stringify(merged));
}

export async function clearall(): Promise<void> {
  await Promise.all([
    remove("token"),
    remove("vault"),
    remove("preferences"),
    remove("vaultkey"),
  ]);
}
