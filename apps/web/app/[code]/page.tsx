"use client"

import { useEffect, useState } from "react"

export default function Claim({ params }: { params: Promise<{ code: string }> }) {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "copied">("loading")
  const [name, setName] = useState("")
  const [value, setValue] = useState("")

  useEffect(() => {
    async function claim() {
      try {
        const { code } = await params
        const key = window.location.hash.slice(1)
        if (!key) {
          setStatus("error")
          return
        }
        const res = await fetch(`/api/claim/${code}`)
        if (!res.ok) {
          setStatus("error")
          return
        }
        const { data } = await res.json()
        const decrypted = await decrypt(data, key)
        const [n, ...rest] = decrypted.split("=")
        setName(n)
        setValue(rest.join("="))
        setStatus("success")
      } catch {
        setStatus("error")
      }
    }
    claim()
  }, [params])

  async function decrypt(encoded: string, key: string): Promise<string> {
    const data = Uint8Array.from(atob(encoded.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0))
    const iv = data.slice(0, 12)
    const encrypted = data.slice(12)
    const keyData = new TextEncoder().encode(key.padEnd(32, "0").slice(0, 32))
    const cryptoKey = await crypto.subtle.importKey("raw", keyData, "AES-GCM", false, ["decrypt"])
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, encrypted)
    return new TextDecoder().decode(decrypted)
  }

  function mask(v: string): string {
    if (v.length <= 8) return "*".repeat(v.length)
    return v.slice(0, 4) + "*".repeat(v.length - 8) + v.slice(-4)
  }

  async function copy() {
    await navigator.clipboard.writeText(`${name}=${value}`)
    setStatus("copied")
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "4rem 1.5rem" }}>
      <p style={{ color: "#444", fontSize: 11, marginBottom: "2rem" }}>noro.sh</p>

      {status === "loading" && (
        <p style={{ fontSize: 13, color: "#555" }}>decrypting...</p>
      )}

      {status === "error" && (
        <div>
          <p style={{ fontSize: 13, color: "#e55" }}>✗ secret not found or already claimed</p>
          <p style={{ fontSize: 11, color: "#555", marginTop: "1rem" }}>secrets can only be claimed once</p>
        </div>
      )}

      {(status === "success" || status === "copied") && (
        <div>
          <p style={{ fontSize: 13, marginBottom: "1.5rem" }}>✓ secret decrypted</p>
          <pre style={{ background: "#111", padding: "0.75rem", borderRadius: 6, fontSize: 11, lineHeight: 1.6, border: "1px solid #222", color: "#888", marginBottom: "1rem" }}>
            {name}={mask(value)}
          </pre>
          <button
            onClick={copy}
            style={{
              background: status === "copied" ? "#1a3a1a" : "#111",
              border: "1px solid #222",
              color: status === "copied" ? "#5e5" : "#888",
              padding: "0.5rem 1rem",
              borderRadius: 6,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {status === "copied" ? "✓ copied" : "copy to clipboard"}
          </button>
          <p style={{ fontSize: 11, color: "#555", marginTop: "1.5rem" }}>or claim via cli:</p>
          <pre style={{ background: "#111", padding: "0.75rem", borderRadius: 6, fontSize: 11, lineHeight: 1.6, border: "1px solid #222", color: "#888" }}>
            npx noro {typeof window !== "undefined" ? window.location.pathname.slice(1) + window.location.hash : ""}
          </pre>
        </div>
      )}
    </div>
  )
}
