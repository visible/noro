"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { highlight } from "@/lib/highlight"

type Language = "en" | "jp"
type Status = "loading" | "confirm" | "claiming" | "success" | "notfound" | "error"

const content = {
  en: {
    title: "secret",
    loading: "checking...",
    confirm: "a secret is waiting for you",
    confirmWarning: "once revealed, this secret will be permanently deleted",
    confirmButton: "reveal secret",
    claiming: "decrypting...",
    notfound: "this secret has expired or already been viewed",
    error: "failed to retrieve secret",
    label: "label",
    value: "value",
    filename: "file",
    copy: "copy",
    copied: "copied",
    download: "download",
    show: "show",
    hide: "hide",
    warning: "this secret has been permanently deleted",
    remaining: "views remaining",
    create: "create your own",
  },
  jp: {
    title: "シークレット",
    loading: "確認中...",
    confirm: "シークレットが届いています",
    confirmWarning: "表示後、このシークレットは完全に削除されます",
    confirmButton: "シークレットを表示",
    claiming: "復号中...",
    notfound: "このシークレットは期限切れか既に閲覧済みです",
    error: "シークレットの取得に失敗",
    label: "ラベル",
    value: "値",
    filename: "ファイル",
    copy: "コピー",
    copied: "コピー済",
    download: "ダウンロード",
    show: "表示",
    hide: "隠す",
    warning: "このシークレットは完全に削除されました",
    remaining: "残り閲覧回数",
    create: "新規作成",
  },
}

async function decrypt(encrypted: string, key: string): Promise<Uint8Array> {
  const base64 = encrypted.replace(/-/g, "+").replace(/_/g, "/")
  const padding = (4 - (base64.length % 4)) % 4
  const padded = base64 + "=".repeat(padding)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const iv = bytes.slice(0, 12)
  const data = bytes.slice(12)
  const encoder = new TextEncoder()
  const keyData = encoder.encode(key.padEnd(32, "0").slice(0, 32))
  const cryptoKey = await crypto.subtle.importKey("raw", keyData, "AES-GCM", false, ["decrypt"])
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, data)
  return new Uint8Array(decrypted)
}

function parse(text: string): { label?: string; value: string } {
  const idx = text.indexOf("=")
  if (idx > 0 && idx < text.length - 1) {
    return { label: text.slice(0, idx), value: text.slice(idx + 1) }
  }
  return { value: text }
}

interface SecretData {
  type: "text" | "file"
  label?: string
  value: string
  filename?: string
  mimetype?: string
  remaining: number
  bytes?: Uint8Array
}

export default function ClaimPage({ params }: { params: Promise<{ code: string }> }) {
  const [lang, setLang] = useState<Language>("en")
  const [status, setStatus] = useState<Status>("loading")
  const [secret, setSecret] = useState<SecretData | null>(null)
  const [copied, setCopied] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [peekdata, setPeekdata] = useState<{ type: "text" | "file"; filename?: string } | null>(null)

  const t = content[lang]

  useEffect(() => {
    async function peek() {
      try {
        const { code } = await params
        const key = window.location.hash.slice(1)
        if (!key) {
          setStatus("error")
          return
        }
        const res = await fetch(`/api/peek/${code}`)
        if (res.status === 404) {
          setStatus("notfound")
          return
        }
        if (!res.ok) {
          setStatus("error")
          return
        }
        const data = await res.json()
        setPeekdata({ type: data.type, filename: data.filename })
        setStatus("confirm")
      } catch {
        setStatus("error")
      }
    }
    peek()
  }, [params])

  const handleReveal = async () => {
    setStatus("claiming")
    try {
      const { code } = await params
      const key = window.location.hash.slice(1)
      const res = await fetch(`/api/claim/${code}`)
      if (res.status === 404) {
        setStatus("notfound")
        return
      }
      if (!res.ok) {
        setStatus("error")
        return
      }
      const { data, type, filename, mimetype, remaining } = await res.json()
      const decrypted = await decrypt(data, key)
      if (type === "file") {
        setSecret({ type: "file", filename, mimetype, remaining, bytes: decrypted, value: "" })
      } else {
        const text = new TextDecoder().decode(decrypted)
        const parsed = parse(text)
        setSecret({ type: "text", ...parsed, remaining })
      }
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  const handleCopy = async () => {
    if (!secret || secret.type !== "text") return
    await navigator.clipboard.writeText(secret.value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!secret || secret.type !== "file" || !secret.bytes) return
    const blob = new Blob([secret.bytes], { type: secret.mimetype || "application/octet-stream" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = secret.filename || "download"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const highlighted = secret?.type === "text" ? highlight(secret.value) : null

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#FF6B00] selection:text-black">
      <nav className="fixed top-0 right-0 p-4 sm:p-8 z-50">
        <div className="flex items-center gap-2 text-xs tracking-widest">
          <button
            onClick={() => setLang("en")}
            className={lang === "en" ? "text-[#FF6B00]" : "text-white/30 hover:text-white"}
            type="button"
          >
            EN
          </button>
          <span className="text-white/20">/</span>
          <button
            onClick={() => setLang("jp")}
            className={lang === "jp" ? "text-[#FF6B00]" : "text-white/30 hover:text-white"}
            type="button"
          >
            JP
          </button>
        </div>
      </nav>

      <Link href="/" className="fixed bottom-0 right-0 p-4 sm:p-8 z-50 hover:opacity-60 transition-opacity">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fill="#fff"
            d="M17.5,3.875 C19.7782,3.875 21.625,5.72183 21.625,8 C21.625,9.2471 21.0714,10.36501 20.1971,11.12122 C20.4748,11.86972 20.625,12.66939 20.625,13.5 C20.625,15.89 19.382,18.0188 17.4446,19.4143 C17.1624,19.6176 16.8653,19.8054 16.5551,19.9763 L16.5183,19.9964 C15.2037,20.7125 13.6559,21.125 12,21.125 C10.34411,21.125 8.79628,20.7124 7.48166,19.9964 C7.1745,19.8291 6.88004,19.6452 6.59991,19.4462 L6.55539,19.4143 C4.61803,18.0188 3.375,15.89 3.375,13.5 C3.375,12.66939 3.52525,11.86971 3.80294,11.12122 C2.92856,10.36501 2.375,9.2471 2.375,8 C2.375,5.72183 4.22183,3.875 6.5,3.875 C8.07432,3.875 9.44244,4.75696 10.1376,6.05321 C10.73749,5.9365 11.36069,5.875 12,5.875 C12.6393,5.875 13.2625,5.9365 13.8624,6.05321 C14.5576,4.75696 15.9257,3.875 17.5,3.875 Z M13.5225,16.3968 C13.4126,16.6012 13.2228,16.7712 12.99,16.8943 C12.7145,17.04 12.3705,17.125 12,17.125 C11.62961,17.125 11.28562,17.0401 11.01014,16.8944 C10.77744,16.7713 10.58761,16.6014 10.47768,16.3971 C9.33578,16.8209 8.41869,17.7081 7.95497,18.8301 C9.1128,19.4892 10.50081,19.875 12,19.875 C13.4993,19.875 14.8874,19.4892 16.0453,18.8299 C15.7958,18.2257 15.4115,17.6816 14.9154,17.2378 C14.5045,16.8703 14.0326,16.586 13.5225,16.3968 Z M12,7.125 C7.88428,7.125 4.625,10.02458 4.625,13.5 C4.625,15.2987 5.49533,16.9402 6.9074,18.1082 C7.80618,16.1978 9.74847,14.875 12,14.875 C13.4399,14.875 14.7538,15.4162 15.7487,16.3061 C16.3092,16.8075 16.7686,17.4196 17.0926,18.1082 C18.5047,16.9402 19.375,15.2987 19.375,13.5 C19.375,10.02458 16.1157,7.125 12,7.125 Z M6.5,5.125 C4.91218,5.125 3.625,6.41218 3.625,8 C3.625,8.73272 3.90091,9.41662 4.37336,9.93541 C5.34066,8.32097 6.94287,7.05326 8.88195,6.38844 C8.35812,5.61513 7.47532,5.125 6.5,5.125 Z M17.5,5.125 C16.5254,5.125 15.6424,5.6143 15.1181,6.38845 C17.0571,7.05327 18.6593,8.32095 19.6266,9.93534 C20.1002,9.41558 20.375,8.73173 20.375,8 C20.375,6.41218 19.0878,5.125 17.5,5.125 Z"
          />
        </svg>
      </Link>

      <section className="min-h-screen flex items-center justify-center px-4 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 sm:mb-16">
            <div className="relative">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter border-b-4 border-[#FF6B00] inline-block invisible">
                {content.en.title}
              </h1>
              <h1
                className="absolute top-0 left-0 text-3xl sm:text-4xl font-bold tracking-tighter border-b-4 border-[#FF6B00] transition-opacity duration-200"
                style={{ opacity: lang === "en" ? 1 : 0 }}
              >
                {content.en.title}
              </h1>
              <h1
                className="absolute top-0 left-0 text-3xl sm:text-4xl font-bold tracking-tighter border-b-4 border-[#FF6B00] transition-opacity duration-200"
                style={{ opacity: lang === "jp" ? 1 : 0 }}
              >
                {content.jp.title}
              </h1>
            </div>
            <div className="mt-4 h-5"></div>
          </div>

          <div className="relative min-h-[340px]">
            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{ opacity: status === "loading" ? 1 : 0, pointerEvents: status === "loading" ? "auto" : "none" }}
            >
              <p className="text-white/40 text-sm">{t.loading}</p>
            </div>

            <div
              className="absolute inset-0 space-y-6 transition-opacity duration-300"
              style={{ opacity: status === "confirm" ? 1 : 0, pointerEvents: status === "confirm" ? "auto" : "none" }}
            >
              <div className="space-y-2">
                <p className="text-white text-sm">{t.confirm}</p>
                <p className="text-white/30 text-xs">{t.confirmWarning}</p>
              </div>
              <button
                type="button"
                onClick={handleReveal}
                className="w-full bg-[#FF6B00] text-black py-3 text-sm tracking-widest font-bold hover:bg-white transition-colors"
              >
                {t.confirmButton}
              </button>
            </div>

            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{ opacity: status === "claiming" ? 1 : 0, pointerEvents: status === "claiming" ? "auto" : "none" }}
            >
              <p className="text-white/40 text-sm">{t.claiming}</p>
            </div>

            <div
              className="absolute inset-0 space-y-6 transition-opacity duration-300"
              style={{ opacity: status === "notfound" ? 1 : 0, pointerEvents: status === "notfound" ? "auto" : "none" }}
            >
              <p className="text-white/40 text-sm">{t.notfound}</p>
              <Link
                href="/share"
                className="inline-block border border-white/10 px-6 py-3 text-sm tracking-widest text-white/40 hover:text-white hover:border-white/30 transition-colors"
              >
                {t.create}
              </Link>
            </div>

            <div
              className="absolute inset-0 space-y-6 transition-opacity duration-300"
              style={{ opacity: status === "error" ? 1 : 0, pointerEvents: status === "error" ? "auto" : "none" }}
            >
              <p className="text-red-400 text-sm">{t.error}</p>
              <Link
                href="/share"
                className="inline-block border border-white/10 px-6 py-3 text-sm tracking-widest text-white/40 hover:text-white hover:border-white/30 transition-colors"
              >
                {t.create}
              </Link>
            </div>

            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{ opacity: status === "success" ? 1 : 0, pointerEvents: status === "success" ? "auto" : "none" }}
            >
              {secret?.type === "text" ? (
                <>
                  <div className="h-[38px] mb-6">
                    {secret.label && (
                      <>
                        <p className="text-xs tracking-widest text-white/40 mb-2">{t.label}</p>
                        <p className="text-[#FF6B00] font-mono text-sm">{secret.label}</p>
                      </>
                    )}
                  </div>

                  <div className="mb-6">
                    <p className="text-xs tracking-widest text-white/40 mb-2">{t.value}</p>
                    {highlighted?.isjson ? (
                      <div className="border border-white/10 p-4 bg-white/5 max-h-[200px] overflow-auto">
                        <pre
                          className="text-sm font-mono whitespace-pre-wrap break-all"
                          dangerouslySetInnerHTML={{ __html: revealed ? highlighted.html : "••••••••••••••••••••••••••••••••" }}
                        />
                        <button
                          type="button"
                          onClick={() => setRevealed(!revealed)}
                          className="text-white/40 hover:text-white text-xs tracking-widest mt-2"
                        >
                          {revealed ? t.hide : t.show}
                        </button>
                      </div>
                    ) : (
                      <div className="border border-white/10 p-4 bg-white/5 flex items-center gap-3 min-h-[52px]">
                        <code className="text-sm text-white/80 font-mono flex-1 break-all">
                          {revealed ? secret.value : "••••••••••••••••••••••••••••••••"}
                        </code>
                        <button
                          type="button"
                          onClick={() => setRevealed(!revealed)}
                          className="text-white/40 hover:text-white text-xs tracking-widest shrink-0"
                        >
                          {revealed ? t.hide : t.show}
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full bg-[#FF6B00] text-black py-3 text-sm tracking-widest font-bold hover:bg-white transition-colors mb-6"
                  >
                    {copied ? t.copied : t.copy}
                  </button>
                </>
              ) : secret?.type === "file" ? (
                <>
                  <div className="mb-6">
                    <p className="text-xs tracking-widest text-white/40 mb-2">{t.filename}</p>
                    <p className="text-[#FF6B00] font-mono text-sm">{secret.filename}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full bg-[#FF6B00] text-black py-3 text-sm tracking-widest font-bold hover:bg-white transition-colors mb-6"
                  >
                    {t.download}
                  </button>
                </>
              ) : null}

              {secret && secret.remaining > 0 && (
                <p className="text-xs text-[#FF6B00] text-center mb-6">
                  {secret.remaining} {t.remaining}
                </p>
              )}

              <p className="text-xs text-white/30 text-center mb-6">
                {secret && secret.remaining === 0 ? t.warning : ""}
              </p>

              <Link
                href="/share"
                className="block w-full text-center border border-white/10 py-3 text-sm tracking-widest text-white/40 hover:text-white hover:border-white/30 transition-colors"
              >
                {t.create}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
