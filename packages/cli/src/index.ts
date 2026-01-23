#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs"
import { execSync } from "child_process"
import { join } from "path"

const API = process.env.NORO_API || "https://noro.sh"

async function encrypt(text: string, key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const keyData = encoder.encode(key.padEnd(32, "0").slice(0, 32))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cryptoKey = await crypto.subtle.importKey("raw", keyData, "AES-GCM", false, ["encrypt"])
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, data)
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)
  return Buffer.from(combined).toString("base64url")
}

async function decrypt(encoded: string, key: string): Promise<string> {
  const data = Buffer.from(encoded, "base64url")
  const iv = data.slice(0, 12)
  const encrypted = data.slice(12)
  const keyData = new TextEncoder().encode(key.padEnd(32, "0").slice(0, 32))
  const cryptoKey = await crypto.subtle.importKey("raw", keyData, "AES-GCM", false, ["decrypt"])
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, encrypted)
  return new TextDecoder().decode(decrypted)
}

function readenv(name: string): string | null {
  if (process.env[name]) return process.env[name]!
  const envpath = join(process.cwd(), ".env")
  if (!existsSync(envpath)) return null
  const content = readFileSync(envpath, "utf-8")
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

function writeenv(name: string, value: string): boolean {
  const envpath = join(process.cwd(), ".env")
  if (!existsSync(envpath)) return false
  let content = readFileSync(envpath, "utf-8")
  const regex = new RegExp(`^${name}=.*$`, "m")
  if (regex.test(content)) {
    content = content.replace(regex, `${name}=${value}`)
  } else {
    content = content.trim() + `\n${name}=${value}\n`
  }
  writeFileSync(envpath, content)
  return true
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

async function share(name: string) {
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
    body: JSON.stringify({ data: encrypted }),
  })
  if (!res.ok) {
    console.log("✗ failed to create link")
    process.exit(1)
  }
  const { id } = await res.json()
  console.log(`\n  ${API}/${id}#${key}\n`)
  console.log(`  or: npx noro ${id}#${key}\n`)
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
  const envpath = join(process.cwd(), ".env")
  if (existsSync(envpath)) {
    writeenv(name, value)
    console.log(`✓ added ${name} to .env`)
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
    noro share <VAR>     share an env var
    noro <code>          claim a shared secret
`)
    process.exit(0)
  }
  if (args[0] === "share") {
    if (!args[1]) {
      console.log("✗ specify a variable name")
      process.exit(1)
    }
    await share(args[1])
  } else {
    await claim(args[0])
  }
}

main().catch(console.error)
