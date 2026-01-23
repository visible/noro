#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs"
import { execSync } from "child_process"
import { join } from "path"
import { encrypt, decrypt } from "./crypto"

const API = process.env.NORO_API || "https://noro.sh"
const TTLS = ["1h", "6h", "12h", "1d", "7d"]

function parseenvfile(filepath: string, name: string): string | null {
  if (!existsSync(filepath)) return null
  const content = readFileSync(filepath, "utf-8")
  for (const line of content.split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match && match[1].trim() === name) {
      let value = match[2].trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      return value
    }
  }
  return null
}

function readenv(name: string): string | null {
  if (process.env[name]) return process.env[name]!
  const cwd = process.cwd()
  return parseenvfile(join(cwd, ".env.local"), name)
    || parseenvfile(join(cwd, ".env"), name)
}

function getenvpath(): string | null {
  const cwd = process.cwd()
  const local = join(cwd, ".env.local")
  const regular = join(cwd, ".env")
  if (existsSync(local)) return local
  if (existsSync(regular)) return regular
  return null
}

function writeenv(name: string, value: string): string | null {
  const envpath = getenvpath()
  if (!envpath) return null
  let content = readFileSync(envpath, "utf-8")
  const regex = new RegExp(`^${name}=.*$`, "m")
  if (regex.test(content)) {
    content = content.replace(regex, `${name}=${value}`)
  } else {
    content = content.trim() + `\n${name}=${value}\n`
  }
  writeFileSync(envpath, content)
  return envpath
}

function copy(text: string) {
  try {
    execSync(`echo ${JSON.stringify(text)} | pbcopy`, { stdio: "pipe" })
    return true
  } catch {
    try {
      execSync(`echo ${JSON.stringify(text)} | xclip -selection clipboard`, { stdio: "pipe" })
      return true
    } catch {
      return false
    }
  }
}

function mask(value: string): string {
  if (value.length <= 8) return "*".repeat(value.length)
  return value.slice(0, 4) + "*".repeat(value.length - 8) + value.slice(-4)
}

async function share(name: string, ttl: string) {
  const value = readenv(name)
  if (!value) {
    console.log(`✗ ${name} not found`)
    process.exit(1)
  }
  const key = crypto.randomUUID().replace(/-/g, "")
  const encrypted = await encrypt(`${name}=${value}`, key)
  const res = await fetch(`${API}/api/store`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: encrypted, ttl }),
  })
  if (!res.ok) {
    console.log("✗ failed to create link")
    process.exit(1)
  }
  const { id } = await res.json()
  console.log(`\n  ${API}/${id}#${key}\n`)
  console.log(`  or: npx noro ${id}#${key}`)
  console.log(`  expires: ${ttl}\n`)
}

async function claim(code: string) {
  const [id, key] = code.replace(`${API}/`, "").split("#")
  if (!id || !key) {
    console.log("✗ invalid code")
    process.exit(1)
  }
  const res = await fetch(`${API}/api/claim/${id}`)
  if (!res.ok) {
    console.log("✗ secret not found or already claimed")
    process.exit(1)
  }
  const { data } = await res.json()
  const decrypted = await decrypt(data, key)
  const [name, ...rest] = decrypted.split("=")
  const value = rest.join("=")
  const envpath = writeenv(name, value)
  if (envpath) {
    const filename = envpath.endsWith(".env.local") ? ".env.local" : ".env"
    console.log(`✓ added ${name} to ${filename}`)
  } else {
    console.log(`\n  ${name}=${mask(value)}\n`)
    if (copy(`${name}=${value}`)) {
      console.log("  ✓ copied to clipboard\n")
    }
  }
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
  noro - share env vars with one command

  usage:
    noro share <VAR> [--ttl=1d]     share an env var
    noro <code>                     claim a shared secret

  ttl options:
    1h, 6h, 12h, 1d (default), 7d
`)
    process.exit(0)
  }
  if (args[0] === "share") {
    if (!args[1]) {
      console.log("✗ specify a variable name")
      process.exit(1)
    }
    let ttl = "1d"
    const ttlArg = args.find(a => a.startsWith("--ttl="))
    if (ttlArg) {
      const val = ttlArg.split("=")[1]
      if (TTLS.includes(val)) {
        ttl = val
      } else {
        console.log(`✗ invalid ttl. options: ${TTLS.join(", ")}`)
        process.exit(1)
      }
    }
    await share(args[1], ttl)
  } else {
    await claim(args[0])
  }
}

main().catch(console.error)
