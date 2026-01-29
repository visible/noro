import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

interface Config {
  token?: string;
  apiUrl: string;
}

const configDir = join(homedir(), ".noro");
const configFile = join(configDir, "config.json");

function ensureDir(): void {
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true, mode: 0o700 });
  }
}

export function loadConfig(): Config {
  const defaults: Config = {
    apiUrl: "https://noro.sh",
  };

  if (!existsSync(configFile)) {
    return defaults;
  }

  try {
    const data = readFileSync(configFile, "utf-8");
    return { ...defaults, ...JSON.parse(data) };
  } catch {
    return defaults;
  }
}

export function saveConfig(config: Partial<Config>): void {
  ensureDir();
  const current = loadConfig();
  const updated = { ...current, ...config };
  writeFileSync(configFile, JSON.stringify(updated, null, 2), { mode: 0o600 });
}

export function clearConfig(): void {
  if (existsSync(configFile)) {
    unlinkSync(configFile);
  }
}

export function getToken(): string | undefined {
  return loadConfig().token;
}

export function setToken(token: string): void {
  saveConfig({ token });
}

export function getApiUrl(): string {
  return loadConfig().apiUrl;
}
