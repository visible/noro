"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { encrypt } from "@/lib/crypto";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/language";

type Mode = "text" | "file";

export default function SharePage() {
  const t = useTranslations("share");
  const [mode, setMode] = useState<Mode>("text");
  const [label, setLabel] = useState("");
  const [secret, setSecret] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [views, setViews] = useState(1);
  const [ttl, setTtl] = useState("1d");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [dragover, setDragover] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "text" && !secret) return;
    if (mode === "file" && !file) return;

    setIsGenerating(true);

    try {
      const key = crypto.randomUUID().replace(/-/g, "");
      let payload: Uint8Array;
      let type: "text" | "file" = "text";
      let filename: string | undefined;
      let mimetype: string | undefined;

      if (mode === "file" && file) {
        const buffer = await file.arrayBuffer();
        payload = new Uint8Array(buffer);
        type = "file";
        filename = file.name;
        mimetype = file.type || "application/octet-stream";
      } else {
        const text = label ? `${label}=${secret}` : secret;
        payload = new TextEncoder().encode(text);
      }

      const encrypted = await encrypt(payload, key);

      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: encrypted,
          type,
          filename,
          mimetype,
          views,
          ttl,
        }),
      });

      if (!res.ok) throw new Error("Failed to store");

      const { id } = await res.json();
      setGeneratedLink(`${window.location.origin}/${id}#${key}`);
    } catch {
      alert("Failed to create link");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setTimeout(async () => {
      try {
        const current = await navigator.clipboard.readText();
        if (current === generatedLink) {
          await navigator.clipboard.writeText("");
        }
      } catch {}
    }, 30000);
  };

  const handleReset = () => {
    setLabel("");
    setSecret("");
    setFile(null);
    setViews(1);
    setTtl("1d");
    setGeneratedLink("");
    setCopied(false);
    setRevealed(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.size <= 5 * 1024 * 1024) {
      setFile(dropped);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.size <= 5 * 1024 * 1024) {
      setFile(selected);
    }
  };

  const canSubmit = mode === "text" ? !!secret : !!file;

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
              {t("title")}
            </h1>
            <p className="mt-4 text-white/40 text-sm">{t("subtitle")}</p>
          </div>

          <div className="relative min-h-[420px]">
            <form
              onSubmit={handleSubmit}
              className="absolute inset-0 space-y-6 transition-opacity duration-300"
              style={{
                opacity: generatedLink ? 0 : 1,
                pointerEvents: generatedLink ? "none" : "auto",
              }}
            >
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setMode("text")}
                  className={`px-4 py-2 text-xs tracking-widest transition-colors border ${
                    mode === "text"
                      ? "bg-[#FF6B00] text-black border-[#FF6B00]"
                      : "border-white/10 text-white/40 hover:text-white hover:border-white/30"
                  }`}
                >
                  {t("text")}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("file")}
                  className={`px-4 py-2 text-xs tracking-widest transition-colors border ${
                    mode === "file"
                      ? "bg-[#FF6B00] text-black border-[#FF6B00]"
                      : "border-white/10 text-white/40 hover:text-white hover:border-white/30"
                  }`}
                >
                  {t("file")}
                </button>
              </div>

              <div>
                <label className="text-xs tracking-widest text-white/40 block mb-2">
                  {t("labelLabel")}
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={t("labelPlaceholder")}
                  className="w-full bg-transparent border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6B00] transition-colors font-mono text-sm"
                />
              </div>

              <div className="h-[144px]">
                <label className="text-xs tracking-widest text-white/40 block mb-2">
                  {mode === "text" ? t("secretLabel") : t("fileLabel")}
                </label>
                <div className="h-[120px]">
                  {mode === "text" ? (
                    <textarea
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      placeholder={t("secretPlaceholder")}
                      className="w-full h-full bg-transparent border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6B00] transition-colors resize-none font-mono text-sm"
                    />
                  ) : (
                    <div
                      onClick={() => fileRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragover(true);
                      }}
                      onDragLeave={() => setDragover(false)}
                      onDrop={handleFileDrop}
                      className={`w-full h-full border px-4 flex items-center justify-center text-center cursor-pointer transition-colors ${
                        dragover
                          ? "border-[#FF6B00] bg-[#FF6B00]/5"
                          : file
                            ? "border-[#FF6B00]/50 bg-[#FF6B00]/5"
                            : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div>
                        {file ? (
                          <p className="text-[#FF6B00] font-mono text-sm">{file.name}</p>
                        ) : (
                          <>
                            <p className="text-white/40 text-sm mb-1">{t("dropzone")}</p>
                            <p className="text-white/20 text-xs">{t("maxsize")}</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs tracking-widest text-white/40 block mb-2">
                    {t("views")}
                  </label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setViews(n)}
                        className={`flex-1 h-9 text-sm transition-colors ${
                          views === n
                            ? "bg-[#FF6B00] text-black"
                            : "border border-white/10 text-white/40 hover:text-white hover:border-white/30"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs tracking-widest text-white/40 block mb-2">
                    {t("expires")}
                  </label>
                  <div className="flex gap-1.5">
                    {["1h", "1d", "7d"].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setTtl(v)}
                        className={`flex-1 h-9 text-sm transition-colors ${
                          ttl === v
                            ? "bg-[#FF6B00] text-black"
                            : "border border-white/10 text-white/40 hover:text-white hover:border-white/30"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <ul className="space-y-1">
                <li className="text-xs text-white/30 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#FF6B00] rounded-full" />
                  {t("security.encrypted")}
                </li>
                <li className="text-xs text-white/30 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#FF6B00] rounded-full" />
                  {t("security.server")}
                </li>
                <li className="text-xs text-white/30 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#FF6B00] rounded-full" />
                  {t("security.destruct")}
                </li>
              </ul>

              <button
                type="submit"
                disabled={!canSubmit || isGenerating}
                className="w-full bg-[#FF6B00] text-black py-3 text-sm tracking-widest font-bold hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isGenerating ? t("generating") : t("button")}
              </button>
            </form>

            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: generatedLink ? 1 : 0,
                pointerEvents: generatedLink ? "auto" : "none",
              }}
            >
              <div className="h-[38px] mb-6">
                <p className="text-[#FF6B00] text-sm">{t("success")}</p>
              </div>

              <div className="mb-6">
                <p className="text-xs tracking-widest text-white/40 mb-2 invisible">link</p>
                <div className="border border-white/10 p-4 bg-white/5 flex items-center gap-3 h-[52px]">
                  <code className="text-sm text-white/80 font-mono flex-1 truncate">
                    {revealed ? generatedLink : "••••••••••••••••••••••••••••••••"}
                  </code>
                  <button
                    type="button"
                    onClick={() => setRevealed(!revealed)}
                    className="text-white/40 hover:text-white text-xs tracking-widest shrink-0"
                  >
                    {revealed ? "hide" : "show"}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full bg-[#FF6B00] text-black py-3 text-sm tracking-widest font-bold hover:opacity-80 transition-opacity mb-2"
              >
                {copied ? t("copied") : t("copy")}
              </button>

              <p className="text-xs text-white/20 text-center mb-6">
                {copied ? t("clipboardNote") : t("expiresNote")}
              </p>

              <button
                type="button"
                onClick={handleReset}
                className="w-full border border-white/10 py-3 text-sm tracking-widest text-white/40 hover:text-white hover:border-white/30 transition-colors"
              >
                {t("newLink")}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
