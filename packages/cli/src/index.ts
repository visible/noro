#!/usr/bin/env node

import * as p from "@clack/prompts";
import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { decrypt, encrypt } from "./crypto";

const TTLS = ["1h", "6h", "12h", "1d", "7d"];
const VERSION = "0.0.3";
const CONFIG_DIR = join(homedir(), ".noro");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

interface Config {
  api?: string;
  ttl?: string;
  views?: number;
  peek?: boolean;
}

function loadconfig(): Config {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
}

const config = loadconfig();
const API = process.env.NORO_API || config.api || "https://noro.sh";
const HISTORY_FILE = join(CONFIG_DIR, "history.json");

interface PeekResponse {
  exists: boolean;
  type: string;
  views: number;
  viewed: number;
  data?: string;
}

interface ClaimResponse {
  data: string;
  type: string;
  remaining: number;
}

interface StoreResponse {
  id: string;
}

interface HistoryEntry {
  id: string;
  variables: string[];
  ttl: string;
  created: number;
  expires: number;
}

function loadhistory(): HistoryEntry[] {
  if (!existsSync(HISTORY_FILE)) return [];
  try {
    return JSON.parse(readFileSync(HISTORY_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function savehistory(entries: HistoryEntry[]) {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(HISTORY_FILE, JSON.stringify(entries, null, 2));
}

function addtohistory(entry: HistoryEntry) {
  const history = loadhistory();
  history.unshift(entry);
  savehistory(history.slice(0, 50));
}

function removefromhistory(id: string) {
  const history = loadhistory();
  savehistory(history.filter((e) => e.id !== id));
}

function ttltoms(ttl: string): number {
  const map: Record<string, number> = {
    "1h": 3600000,
    "6h": 21600000,
    "12h": 43200000,
    "1d": 86400000,
    "7d": 604800000,
  };
  return map[ttl] || map["1d"];
}

function parseenvfile(filepath: string, name: string): string | null {
  if (!existsSync(filepath)) return null;
  const content = readFileSync(filepath, "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && match[1].trim() === name) {
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return value;
    }
  }
  return null;
}

function parseallenv(): { name: string; value: string }[] {
  const envpath = getenvpath();
  if (!envpath) return [];
  const content = readFileSync(envpath, "utf-8");
  const vars: { name: string; value: string }[] = [];
  for (const line of content.split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const name = match[1].trim();
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      vars.push({ name, value });
    }
  }
  return vars;
}

function readenv(name: string): string | null {
  if (process.env[name]) return process.env[name]!;
  const cwd = process.cwd();
  return (
    parseenvfile(join(cwd, ".env.local"), name) ||
    parseenvfile(join(cwd, ".env"), name)
  );
}

function getenvpath(): string | null {
  const cwd = process.cwd();
  const local = join(cwd, ".env.local");
  const regular = join(cwd, ".env");
  if (existsSync(local)) return local;
  if (existsSync(regular)) return regular;
  return null;
}

function detectenvfiles(): string[] {
  const cwd = process.cwd();
  try {
    const files = readdirSync(cwd);
    return files
      .filter((f) => f.startsWith(".env"))
      .sort((a, b) => a.length - b.length);
  } catch {
    return [];
  }
}

function appendtofile(filepath: string, vars: { name: string; value: string }[]) {
  let content = "";
  if (existsSync(filepath)) {
    content = readFileSync(filepath, "utf-8");
  }
  for (const { name, value } of vars) {
    const regex = new RegExp(`^${name}=.*$`, "m");
    if (regex.test(content)) {
      content = content.replace(regex, `${name}=${value}`);
    } else {
      content = content.trim() + `\n${name}=${value}`;
    }
  }
  writeFileSync(filepath, content.trim() + "\n");
}

function writeenv(name: string, value: string): string | null {
  const envpath = getenvpath();
  if (!envpath) return null;
  let content = readFileSync(envpath, "utf-8");
  const regex = new RegExp(`^${name}=.*$`, "m");
  if (regex.test(content)) {
    content = content.replace(regex, `${name}=${value}`);
  } else {
    content = content.trim() + `\n\n${name}=${value}\n`;
  }
  writeFileSync(envpath, content);
  return envpath;
}

function copy(text: string) {
  try {
    execSync(`echo ${JSON.stringify(text)} | pbcopy`, { stdio: "pipe" });
    return true;
  } catch {
    try {
      execSync(`echo ${JSON.stringify(text)} | xclip -selection clipboard`, {
        stdio: "pipe",
      });
      return true;
    } catch {
      return false;
    }
  }
}

function mask(value: string): string {
  if (value.length <= 8) return "*".repeat(value.length);
  return value.slice(0, 4) + "*".repeat(value.length - 8) + value.slice(-4);
}

function timeago(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

async function share(names: string[], ttl: string, views: number, peek: boolean) {
  const pairs: string[] = [];
  for (const name of names) {
    const value = readenv(name);
    if (!value) {
      console.log(`✗ ${name} not found`);
      process.exit(1);
    }
    pairs.push(`${name}=${value}`);
  }
  const payload = pairs.join("\n");
  const key = crypto.randomUUID().replace(/-/g, "");
  const encrypted = await encrypt(payload, key);
  const res = await fetch(`${API}/api/store`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: encrypted, ttl, views, peek }),
  });
  if (!res.ok) {
    console.log("✗ failed to create link");
    process.exit(1);
  }
  const { id } = (await res.json()) as StoreResponse;
  const now = Date.now();
  addtohistory({
    id,
    variables: names,
    ttl,
    created: now,
    expires: now + ttltoms(ttl),
  });
  const info = [`${ttl}`, `${views} view${views > 1 ? "s" : ""}`];
  if (peek) info.push("peek");
  console.log(`\n  ${API}/${id}#${key}\n`);
  console.log(`  ${names.join(", ")} · ${info.join(" · ")}\n`);
}

async function push(ttl: string, views: number, peek: boolean) {
  const vars = parseallenv();
  if (vars.length === 0) {
    console.log("✗ no .env file found");
    process.exit(1);
  }
  const names = vars.map((v) => v.name);
  const payload = vars.map((v) => `${v.name}=${v.value}`).join("\n");
  const key = crypto.randomUUID().replace(/-/g, "");
  const encrypted = await encrypt(payload, key);
  const res = await fetch(`${API}/api/store`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: encrypted, ttl, views, peek }),
  });
  if (!res.ok) {
    console.log("✗ failed to create link");
    process.exit(1);
  }
  const { id } = (await res.json()) as StoreResponse;
  const now = Date.now();
  addtohistory({
    id,
    variables: names,
    ttl,
    created: now,
    expires: now + ttltoms(ttl),
  });
  const info = [`${ttl}`, `${views} view${views > 1 ? "s" : ""}`];
  if (peek) info.push("peek");
  console.log(`\n  ${API}/${id}#${key}\n`);
  console.log(`  ${names.length} variables · ${info.join(" · ")}\n`);
}

interface ClaimOptions {
  json?: boolean;
  stdout?: boolean;
  vars?: string[];
  output?: string;
}

async function peek(code: string, json: boolean) {
  const [id, key] = code.replace(`${API}/`, "").split("#");
  if (!id || !key) {
    if (json) console.log(JSON.stringify({ error: "invalid code" }));
    else console.log("✗ invalid code");
    process.exit(1);
  }

  const res = await fetch(`${API}/api/peek/${id}`);
  if (!res.ok) {
    if (json) console.log(JSON.stringify({ error: "not found" }));
    else console.log("✗ secret not found");
    process.exit(1);
  }

  const result = (await res.json()) as PeekResponse;
  if (!result.data) {
    if (json) console.log(JSON.stringify({ error: "peek not enabled" }));
    else console.log("✗ peek not enabled for this secret");
    process.exit(1);
  }

  const decrypted = await decrypt(result.data, key);
  const lines = decrypted.split("\n");
  const varkeys: string[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const [name] = line.split("=");
    varkeys.push(name);
  }

  const remaining = result.views - result.viewed;

  if (json) {
    console.log(JSON.stringify({ keys: varkeys, views: result.views, remaining }));
  } else {
    console.log("");
    for (const k of varkeys) {
      console.log(`  ${k}`);
    }
    console.log(`\n  ${remaining}/${result.views} views remaining\n`);
  }
}

async function claim(code: string, options: ClaimOptions = {}) {
  const [id, key] = code.replace(`${API}/`, "").split("#");
  if (!id || !key) {
    if (options.json) {
      console.log(JSON.stringify({ error: "invalid code" }));
    } else {
      console.log("✗ invalid code");
    }
    process.exit(1);
  }
  const res = await fetch(`${API}/api/claim/${id}`);
  if (!res.ok) {
    if (options.json) {
      console.log(JSON.stringify({ error: "secret not found or already claimed" }));
    } else {
      console.log("✗ secret not found or already claimed");
    }
    process.exit(1);
  }
  const { data, remaining } = (await res.json()) as ClaimResponse;
  const decrypted = await decrypt(data, key);
  const lines = decrypted.split("\n");
  const allvars: { name: string; value: string }[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const [name, ...rest] = line.split("=");
    const value = rest.join("=");
    allvars.push({ name, value });
  }

  if (allvars.length === 0) {
    if (options.json) {
      console.log(JSON.stringify({ error: "no variables found" }));
    } else {
      console.log("✗ no variables found");
    }
    process.exit(1);
  }

  const noninteractive = options.json || options.stdout || options.output || options.vars;

  if (noninteractive) {
    let chosen = allvars;
    if (options.vars && options.vars.length > 0) {
      chosen = allvars.filter((v) => options.vars!.includes(v.name));
      if (chosen.length === 0) {
        if (options.json) {
          console.log(JSON.stringify({ error: "no matching variables", available: allvars.map((v) => v.name), remaining }));
        } else {
          console.log(`✗ no matching variables. available: ${allvars.map((v) => v.name).join(", ")}`);
        }
        process.exit(1);
      }
    }

    if (options.json) {
      console.log(JSON.stringify({ variables: chosen, remaining }));
      return;
    }

    if (options.stdout) {
      for (const v of chosen) {
        console.log(`${v.name}=${v.value}`);
      }
      return;
    }

    if (options.output) {
      let filepath = options.output;
      if (!filepath.startsWith("/")) {
        filepath = join(process.cwd(), filepath);
      }
      appendtofile(filepath, chosen);
      console.log(`✓ saved ${chosen.length} variable${chosen.length > 1 ? "s" : ""} to ${options.output}`);
      if (remaining > 0) {
        console.log(`  ${remaining} view${remaining !== 1 ? "s" : ""} remaining`);
      }
      return;
    }
  }

  if (allvars.length === 1) {
    const envpath = getenvpath();
    if (envpath) {
      writeenv(allvars[0].name, allvars[0].value);
      const filename = envpath.endsWith(".env.local") ? ".env.local" : ".env";
      console.log(`✓ added ${allvars[0].name} to ${filename}`);
    } else {
      console.log(`\n  ${allvars[0].name}=${mask(allvars[0].value)}\n`);
      if (copy(`${allvars[0].name}=${allvars[0].value}`)) {
        console.log("  ✓ copied to clipboard\n");
      }
    }
    return;
  }

  console.log("");
  const selected = await p.multiselect({
    message: "select variables to save",
    options: allvars.map((v) => ({
      value: v.name,
      label: v.name,
      hint: mask(v.value),
    })),
    initialValues: allvars.map((v) => v.name),
  });

  if (p.isCancel(selected)) {
    p.cancel("cancelled");
    process.exit(0);
  }

  const chosen = allvars.filter((v) => (selected as string[]).includes(v.name));
  if (chosen.length === 0) {
    console.log("✗ no variables selected");
    process.exit(1);
  }

  const envfiles = detectenvfiles();
  const fileoptions: { value: string; label: string }[] = envfiles.map((f) => ({
    value: f,
    label: `${f} (append)`,
  }));
  fileoptions.push({ value: "__new__", label: "new file..." });
  fileoptions.push({ value: "__custom__", label: "custom path..." });
  fileoptions.push({ value: "__clipboard__", label: "copy to clipboard" });

  const destination = await p.select({
    message: "save to",
    options: fileoptions,
  });

  if (p.isCancel(destination)) {
    p.cancel("cancelled");
    process.exit(0);
  }

  let filepath: string;

  if (destination === "__clipboard__") {
    const content = chosen.map((v) => `${v.name}=${v.value}`).join("\n");
    if (copy(content)) {
      console.log(`\n✓ copied ${chosen.length} variable${chosen.length > 1 ? "s" : ""} to clipboard\n`);
    } else {
      console.log("✗ failed to copy to clipboard");
    }
    return;
  }

  if (destination === "__new__") {
    const filename = await p.text({
      message: "filename",
      placeholder: ".env.new",
      defaultValue: ".env.new",
    });
    if (p.isCancel(filename)) {
      p.cancel("cancelled");
      process.exit(0);
    }
    filepath = join(process.cwd(), filename as string);
  } else if (destination === "__custom__") {
    const custompath = await p.text({
      message: "path",
      placeholder: "./config/.env",
    });
    if (p.isCancel(custompath)) {
      p.cancel("cancelled");
      process.exit(0);
    }
    filepath = custompath as string;
    if (!filepath.startsWith("/")) {
      filepath = join(process.cwd(), filepath);
    }
  } else {
    filepath = join(process.cwd(), destination as string);
  }

  appendtofile(filepath, chosen);
  const filename = filepath.split("/").pop();
  console.log(`\n✓ saved ${chosen.length} variable${chosen.length > 1 ? "s" : ""} to ${filename}\n`);
}

async function list() {
  const history = loadhistory();
  const now = Date.now();
  const active = history.filter((e) => e.expires > now);
  if (active.length === 0) {
    console.log("\n  no active secrets\n");
    return;
  }
  console.log("\n  active secrets:\n");
  for (const entry of active) {
    const remaining = timeago(entry.expires - now);
    console.log(
      `  ${entry.id}  ${entry.variables.join(", ")}  expires in ${remaining}`,
    );
  }
  console.log("");
}

async function revoke(id: string) {
  const res = await fetch(`${API}/api/revoke/${id}`, { method: "DELETE" });
  if (res.status === 404) {
    console.log("✗ secret not found or already claimed");
    removefromhistory(id);
    process.exit(1);
  }
  if (!res.ok) {
    console.log("✗ failed to revoke");
    process.exit(1);
  }
  removefromhistory(id);
  console.log(`✓ revoked ${id}`);
}

function saveconfig(cfg: Config) {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2) + "\n");
}

function configcmd(args: string[]) {
  if (args.length === 0) {
    console.log(`\n  config: ${CONFIG_FILE}\n`);
    if (Object.keys(config).length === 0) {
      console.log("  (empty)\n");
    } else {
      for (const [k, v] of Object.entries(config)) {
        console.log(`  ${k} = ${v}`);
      }
      console.log("");
    }
    return;
  }

  const [key, value] = args;

  if (!value) {
    if (key in config) {
      console.log(config[key as keyof Config]);
    }
    return;
  }

  const cfg = { ...config };

  if (value === "unset" || value === "reset") {
    delete cfg[key as keyof Config];
    saveconfig(cfg);
    console.log(`✓ unset ${key}`);
    return;
  }

  if (key === "ttl") {
    if (!TTLS.includes(value)) {
      console.log(`✗ invalid ttl (use: ${TTLS.join(", ")})`);
      process.exit(1);
    }
    cfg.ttl = value;
  } else if (key === "views") {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 1 || n > 5) {
      console.log("✗ invalid views (use: 1-5)");
      process.exit(1);
    }
    cfg.views = n;
  } else if (key === "peek") {
    cfg.peek = value === "true" || value === "1";
  } else if (key === "api") {
    cfg.api = value;
  } else {
    console.log(`✗ unknown key: ${key}`);
    console.log("  valid keys: ttl, views, peek, api");
    process.exit(1);
  }

  saveconfig(cfg);
  console.log(`✓ ${key} = ${cfg[key as keyof Config]}`);
}

function parsettl(args: string[]): string {
  const ttlArg = args.find((a) => a.startsWith("--ttl="));
  if (ttlArg) {
    const val = ttlArg.split("=")[1];
    if (TTLS.includes(val)) return val;
    console.log(`✗ invalid ttl (use: ${TTLS.join(", ")})`);
    process.exit(1);
  }
  return config.ttl && TTLS.includes(config.ttl) ? config.ttl : "1d";
}

function parseviews(args: string[]): number {
  const viewsArg = args.find((a) => a.startsWith("--views="));
  if (viewsArg) {
    const val = parseInt(viewsArg.split("=")[1], 10);
    if (isNaN(val) || val < 1 || val > 5) {
      console.log("✗ invalid views (use: 1-5)");
      process.exit(1);
    }
    return val;
  }
  return config.views && config.views >= 1 && config.views <= 5 ? config.views : 1;
}

function parsepeek(args: string[]): boolean {
  if (args.includes("--peek")) return true;
  return config.peek || false;
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "--version" || args[0] === "-v") {
    console.log(VERSION);
    process.exit(0);
  }

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
  noro - one-time secret sharing

  share        noro share API_KEY
  share many   noro share API_KEY DB_URL
  share .env   noro push
  claim        noro abc123#key
  peek         noro peek abc123#key
  list         noro list
  revoke       noro revoke abc123
  config       noro config [key] [value]

  options      --ttl=1h    expiry (1h/6h/12h/1d/7d)
               --views=2   max views (1-5)
               --peek      enable preview

  scripting    --json      output as json
               --stdout    output key=value lines
               --output=   save to file
               --vars=     filter variables
`);
    process.exit(0);
  }

  if (args[0] === "share") {
    const names = args.slice(1).filter((a) => !a.startsWith("--"));
    if (names.length === 0) {
      console.log("✗ usage: noro share <VAR...>");
      process.exit(1);
    }
    const ttl = parsettl(args);
    const views = parseviews(args);
    const peek = parsepeek(args);
    await share(names, ttl, views, peek);
  } else if (args[0] === "push") {
    const ttl = parsettl(args);
    const views = parseviews(args);
    const peek = parsepeek(args);
    await push(ttl, views, peek);
  } else if (args[0] === "peek") {
    if (!args[1]) {
      console.log("✗ usage: noro peek <code>");
      process.exit(1);
    }
    await peek(args[1], args.includes("--json"));
  } else if (args[0] === "list") {
    await list();
  } else if (args[0] === "config") {
    configcmd(args.slice(1));
  } else if (args[0] === "revoke") {
    if (!args[1]) {
      console.log("✗ usage: noro revoke <id>");
      process.exit(1);
    }
    await revoke(args[1]);
  } else {
    const code = args[0];
    const options: ClaimOptions = {
      json: args.includes("--json"),
      stdout: args.includes("--stdout"),
    };
    const varsArg = args.find((a) => a.startsWith("--vars="));
    if (varsArg) options.vars = varsArg.split("=")[1].split(",");
    const outputArg = args.find((a) => a.startsWith("--output="));
    if (outputArg) options.output = outputArg.split("=")[1];
    await claim(code, options);
  }
}

main().catch(console.error);
