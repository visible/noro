#!/usr/bin/env node

import * as p from "@clack/prompts";
import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { decrypt, encrypt } from "./crypto";

const API = process.env.NORO_API || "https://noro.sh";
const TTLS = ["1h", "6h", "12h", "1d", "7d"];
const HISTORY_DIR = join(homedir(), ".noro");
const HISTORY_FILE = join(HISTORY_DIR, "history.json");

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
  if (!existsSync(HISTORY_DIR)) {
    mkdirSync(HISTORY_DIR, { recursive: true });
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

async function share(names: string[], ttl: string) {
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
    body: JSON.stringify({ data: encrypted, ttl }),
  });
  if (!res.ok) {
    console.log("✗ failed to create link");
    process.exit(1);
  }
  const { id } = await res.json();
  const now = Date.now();
  addtohistory({
    id,
    variables: names,
    ttl,
    created: now,
    expires: now + ttltoms(ttl),
  });
  console.log(`\n  ${API}/${id}#${key}\n`);
  console.log(`  or: npx noro ${id}#${key}`);
  console.log(`  expires: ${ttl}`);
  console.log(`  variables: ${names.join(", ")}\n`);
}

async function push(ttl: string) {
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
    body: JSON.stringify({ data: encrypted, ttl }),
  });
  if (!res.ok) {
    console.log("✗ failed to create link");
    process.exit(1);
  }
  const { id } = await res.json();
  const now = Date.now();
  addtohistory({
    id,
    variables: names,
    ttl,
    created: now,
    expires: now + ttltoms(ttl),
  });
  console.log(`\n  ${API}/${id}#${key}\n`);
  console.log(`  or: npx noro ${id}#${key}`);
  console.log(`  expires: ${ttl}`);
  console.log(`  variables: ${names.join(", ")}\n`);
}

async function claim(code: string) {
  const [id, key] = code.replace(`${API}/`, "").split("#");
  if (!id || !key) {
    console.log("✗ invalid code");
    process.exit(1);
  }
  const res = await fetch(`${API}/api/claim/${id}`);
  if (!res.ok) {
    console.log("✗ secret not found or already claimed");
    process.exit(1);
  }
  const { data } = await res.json();
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
    console.log("✗ no variables found");
    process.exit(1);
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

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
  noro - share env vars with one command

  usage:
    noro share <VAR...> [--ttl=1d]     share env vars
    noro push [--ttl=1d]               share all from .env
    noro list                          show active secrets
    noro revoke <id>                   delete a secret
    noro <code>                        claim a shared secret

  examples:
    noro share API_KEY
    noro share API_KEY DB_URL --ttl=1h
    noro push
    noro list
    noro revoke abc123
    noro abc123#key

  ttl options:
    1h, 6h, 12h, 1d (default), 7d
`);
    process.exit(0);
  }
  if (args[0] === "share") {
    const names = args.slice(1).filter((a) => !a.startsWith("--"));
    if (names.length === 0) {
      console.log("✗ specify at least one variable name");
      process.exit(1);
    }
    let ttl = "1d";
    const ttlArg = args.find((a) => a.startsWith("--ttl="));
    if (ttlArg) {
      const val = ttlArg.split("=")[1];
      if (TTLS.includes(val)) {
        ttl = val;
      } else {
        console.log(`✗ invalid ttl. options: ${TTLS.join(", ")}`);
        process.exit(1);
      }
    }
    await share(names, ttl);
  } else if (args[0] === "push") {
    let ttl = "1d";
    const ttlArg = args.find((a) => a.startsWith("--ttl="));
    if (ttlArg) {
      const val = ttlArg.split("=")[1];
      if (TTLS.includes(val)) {
        ttl = val;
      } else {
        console.log(`✗ invalid ttl. options: ${TTLS.join(", ")}`);
        process.exit(1);
      }
    }
    await push(ttl);
  } else if (args[0] === "list") {
    await list();
  } else if (args[0] === "revoke") {
    if (!args[1]) {
      console.log("✗ specify secret id");
      process.exit(1);
    }
    await revoke(args[1]);
  } else {
    await claim(args[0]);
  }
}

main().catch(console.error);
