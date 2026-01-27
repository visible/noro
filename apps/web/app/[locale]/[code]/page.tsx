"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { decrypt } from "@/lib/crypto";
import { highlight } from "@/lib/highlight";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/languagetoggle";

type Status = "loading" | "confirm" | "claiming" | "success" | "notfound" | "error";

function parse(text: string): { label?: string; value: string } {
  const idx = text.indexOf("=");
  if (idx > 0 && idx < text.length - 1) {
    return { label: text.slice(0, idx), value: text.slice(idx + 1) };
  }
  return { value: text };
}

interface SecretData {
  type: "text" | "file";
  label?: string;
  value: string;
  filename?: string;
  mimetype?: string;
  remaining: number;
  bytes?: Uint8Array;
}

export default function ClaimPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const t = useTranslations("claim");
  const titles = useTranslations("titles");
  const [status, setStatus] = useState<Status>("loading");
  const [secret, setSecret] = useState<SecretData | null>(null);
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    document.title = `${titles(status)} | noro`;
  }, [status, titles]);

  useEffect(() => {
    async function peek() {
      try {
        const { code } = await params;
        const key = window.location.hash.slice(1);
        if (!key) {
          setStatus("error");
          return;
        }
        const res = await fetch(`/api/peek/${code}`);
        if (!res.ok) {
          setStatus("notfound");
          return;
        }
        const data = await res.json();
        if (!data.exists) {
          setStatus("notfound");
          return;
        }
        setStatus("confirm");
      } catch {
        setStatus("error");
      }
    }
    peek();
  }, [params]);

  const handleReveal = async () => {
    setStatus("claiming");
    try {
      const { code } = await params;
      const key = window.location.hash.slice(1);
      const res = await fetch(`/api/claim/${code}`);
      if (!res.ok) {
        setStatus("notfound");
        return;
      }
      const json = await res.json();
      if (!json.exists) {
        setStatus("notfound");
        return;
      }
      const { data, type, filename, mimetype, remaining } = json;
      const decrypted = await decrypt(data, key);
      if (type === "file") {
        setSecret({
          type: "file",
          filename,
          mimetype,
          remaining,
          bytes: decrypted,
          value: "",
        });
      } else {
        const text = new TextDecoder().decode(decrypted);
        const parsed = parse(text);
        setSecret({ type: "text", ...parsed, remaining });
      }
      setStatus("success");
      window.history.replaceState(null, "", window.location.pathname);
    } catch {
      setStatus("error");
    }
  };

  const handleCopy = async () => {
    if (!secret || secret.type !== "text") return;
    await navigator.clipboard.writeText(secret.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!secret || secret.type !== "file" || !secret.bytes) return;
    const blob = new Blob([secret.bytes], {
      type: secret.mimetype || "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = secret.filename || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const highlighted = secret?.type === "text" ? highlight(secret.value) : null;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#FF6B00] selection:text-black">
      <LanguageToggle />
      <Link
        href="/"
        className="fixed bottom-0 right-0 p-4 sm:p-8 z-50 hover:opacity-60 transition-opacity"
      >
        <Logo />
      </Link>

      <section className="min-h-[100dvh] flex items-center justify-center px-4 sm:px-8 pb-32">
        <div className="w-full max-w-md">
          <div className="mb-8 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter border-b-4 border-[#FF6B00] inline-block">
              {titles(status)}
            </h1>
            <p className="mt-4 text-white/40 text-sm invisible">placeholder</p>
          </div>

          <div className="relative min-h-[340px]">
            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: status === "loading" ? 1 : 0,
                pointerEvents: status === "loading" ? "auto" : "none",
              }}
            >
              <p className="text-white/40 text-sm">{t("loading")}</p>
            </div>

            <div
              className="absolute inset-0 space-y-6 transition-opacity duration-300"
              style={{
                opacity: status === "confirm" ? 1 : 0,
                pointerEvents: status === "confirm" ? "auto" : "none",
              }}
            >
              <div className="space-y-2">
                <p className="text-white text-sm">{t("confirm")}</p>
                <p className="text-white/30 text-xs">{t("confirmWarning")}</p>
              </div>
              <button
                type="button"
                onClick={handleReveal}
                className="w-full bg-[#FF6B00] text-black py-3 text-sm tracking-widest font-bold hover:opacity-80 transition-opacity"
              >
                {t("confirmButton")}
              </button>
              <p className="text-white/20 text-xs text-center">{t("extensionWarning")}</p>
            </div>

            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: status === "claiming" ? 1 : 0,
                pointerEvents: status === "claiming" ? "auto" : "none",
              }}
            >
              <p className="text-white/40 text-sm">{t("claiming")}</p>
            </div>

            <div
              className="absolute inset-0 space-y-6 transition-opacity duration-300"
              style={{
                opacity: status === "notfound" || status === "error" ? 1 : 0,
                pointerEvents: status === "notfound" || status === "error" ? "auto" : "none",
              }}
            >
              <div className="space-y-2">
                <p className="text-white text-sm">{t("notfound")}</p>
                <p className="text-white/30 text-xs">{t("notfoundDetail")}</p>
              </div>
              <Link
                href="/share"
                className="block w-full bg-[#FF6B00] text-black py-3 text-sm tracking-widest font-bold hover:opacity-80 transition-opacity text-center"
              >
                {t("create")}
              </Link>
            </div>

            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: status === "success" ? 1 : 0,
                pointerEvents: status === "success" ? "auto" : "none",
              }}
            >
              {secret?.type === "text" ? (
                <>
                  <div className="h-[38px] mb-6">
                    {secret.label && (
                      <>
                        <p className="text-xs tracking-widest text-white/40 mb-2">{t("label")}</p>
                        <p className="text-[#FF6B00] font-mono text-sm">{secret.label}</p>
                      </>
                    )}
                  </div>

                  <div className="mb-6">
                    <p className="text-xs tracking-widest text-white/40 mb-2">{t("value")}</p>
                    {highlighted?.isjson ? (
                      <div className="border border-white/10 p-4 bg-white/5 max-h-[200px] overflow-auto">
                        <pre
                          className="text-sm font-mono whitespace-pre-wrap break-all"
                          dangerouslySetInnerHTML={{
                            __html: revealed
                              ? highlighted.html
                              : "••••••••••••••••••••••••••••••••",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setRevealed(!revealed)}
                          className="text-white/40 hover:text-white text-xs tracking-widest mt-2"
                        >
                          {revealed ? t("hide") : t("show")}
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
                          {revealed ? t("hide") : t("show")}
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full bg-[#FF6B00] text-black py-3 text-sm tracking-widest font-bold hover:opacity-80 transition-opacity mb-6"
                  >
                    {copied ? t("copied") : t("copy")}
                  </button>
                </>
              ) : secret?.type === "file" ? (
                <>
                  <div className="mb-6">
                    <p className="text-xs tracking-widest text-white/40 mb-2">{t("filename")}</p>
                    <p className="text-[#FF6B00] font-mono text-sm">{secret.filename}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full bg-[#FF6B00] text-black py-3 text-sm tracking-widest font-bold hover:opacity-80 transition-opacity mb-6"
                  >
                    {t("download")}
                  </button>
                </>
              ) : null}

              {secret && secret.remaining > 0 && (
                <p className="text-xs text-[#FF6B00] text-center mb-6">
                  {secret.remaining} {t("remaining")}
                </p>
              )}

              <p className="text-xs text-white/30 text-center mb-6">
                {secret && secret.remaining === 0 ? t("warning") : ""}
              </p>

              <Link
                href="/share"
                className="block w-full text-center border border-white/10 py-3 text-sm tracking-widest text-white/40 hover:text-white hover:border-white/30 transition-colors"
              >
                {t("create")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
