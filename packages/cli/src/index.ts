#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { decrypt, encrypt } from "./crypto";

const API = process.env.NORO_API || "https://noro.sh";
const TTLS = ["1h", "6h", "12h", "1d", "7d"];

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
  let envpath: string | null = null;
  const processed: { name: string; value: string }[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const [name, ...rest] = line.split("=");
    const value = rest.join("=");
    processed.push({ name, value });
    const path = writeenv(name, value);
    if (path) envpath = path;
  }
  if (envpath) {
    const filename = envpath.endsWith(".env.local") ? ".env.local" : ".env";
    for (const { name } of processed) {
      console.log(`✓ added ${name} to ${filename}`);
    }
  } else {
    console.log("");
    for (const { name, value } of processed) {
      console.log(`  ${name}=${mask(value)}`);
    }
    console.log("");
    if (processed.length === 1) {
      if (copy(`${processed[0].name}=${processed[0].value}`)) {
        console.log("  ✓ copied to clipboard\n");
      }
    } else {
      const all = processed.map((p) => `${p.name}=${p.value}`).join("\n");
      if (copy(all)) {
        console.log("  ✓ copied all to clipboard\n");
      }
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
  noro - share env vars with one command

  usage:
    noro share <VAR...> [--ttl=1d]     share env vars
    noro <code>                        claim a shared secret

  examples:
    noro share API_KEY
    noro share API_KEY DB_URL --ttl=1h
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
  } else {
    await claim(args[0]);
  }
}

main().catch(console.error);
