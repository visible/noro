"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { encrypt } from "@/lib/crypto";
import type { Language } from "@/lib/types";

type Mode = "text" | "file";

const content = {
  en: {
    title: "share",
    subtitle: "create a one-time secret link",
    text: "text",
    file: "file",
    labelLabel: "label (optional)",
    labelPlaceholder: "e.g. API_KEY",
    secretLabel: "secret",
    secretPlaceholder: "paste your secret here...",
    fileLabel: "file",
    dropzone: "click or drop file",
    maxsize: "max 5mb",
    views: "max views",
    expires: "expires after",
    button: "generate link",
    generating: "encrypting...",
    success: "link created",
    copy: "copy",
    copied: "copied",
    expiresNote: "link expires after viewing",
    clipboardNote: "clipboard will clear in 30s",
    newLink: "create another",
    security: [
      "end-to-end encrypted",
      "server never sees your data",
      "self-destructs after viewing",
    ],
  },
  jp: {
    title: "共有",
    subtitle: "ワンタイムシークレットリンクを作成",
    text: "テキスト",
    file: "ファイル",
    labelLabel: "ラベル（任意）",
    labelPlaceholder: "例: API_KEY",
    secretLabel: "シークレット",
    secretPlaceholder: "ここにシークレットを貼り付け...",
    fileLabel: "ファイル",
    dropzone: "クリックまたはドロップ",
    maxsize: "最大5mb",
    views: "最大閲覧数",
    expires: "有効期限",
    button: "リンクを生成",
    generating: "暗号化中...",
    success: "リンク作成完了",
    copy: "コピー",
    copied: "コピー済",
    expiresNote: "閲覧後にリンクは無効化",
    clipboardNote: "30秒後にクリップボードをクリア",
    newLink: "新規作成",
    security: [
      "エンドツーエンド暗号化",
      "サーバーはデータを見れない",
      "閲覧後に自動削除",
    ],
  },
};

export default function SharePage() {
  const [lang, setLang] = useState<Language>("en");
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

  const t = content[lang];

  useEffect(() => {
    document.title = lang === "en" ? "share | noro" : "共有 | noro";
  }, [lang]);

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
      <nav className="fixed top-0 right-0 p-4 sm:p-8 z-50">
        <div className="flex items-center gap-2 text-xs tracking-widest">
          <button
            onClick={() => setLang("en")}
            className={
              lang === "en"
                ? "text-[#FF6B00]"
                : "text-white/30 hover:text-white"
            }
            type="button"
          >
            EN
          </button>
          <span className="text-white/20">/</span>
          <button
            onClick={() => setLang("jp")}
            className={
              lang === "jp"
                ? "text-[#FF6B00]"
                : "text-white/30 hover:text-white"
            }
            type="button"
          >
            JP
          </button>
        </div>
      </nav>

      <Link
        href="/"
        className="fixed bottom-0 right-0 p-4 sm:p-8 z-50 hover:opacity-60 transition-opacity"
      >
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

      <section className="min-h-[100dvh] flex items-center justify-center px-4 sm:px-8 pb-32">
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
            <div className="relative mt-4">
              <p className="text-white/40 text-sm invisible">
                {content.en.subtitle}
              </p>
              <p
                className="absolute top-0 left-0 text-white/40 text-sm transition-opacity duration-200"
                style={{ opacity: lang === "en" ? 1 : 0 }}
              >
                {content.en.subtitle}
              </p>
              <p
                className="absolute top-0 left-0 text-white/40 text-sm transition-opacity duration-200"
                style={{ opacity: lang === "jp" ? 1 : 0 }}
              >
                {content.jp.subtitle}
              </p>
            </div>
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
                  {t.text}
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
                  {t.file}
                </button>
              </div>

              <div>
                <label className="text-xs tracking-widest text-white/40 block mb-2">
                  {t.labelLabel}
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={t.labelPlaceholder}
                  className="w-full bg-transparent border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6B00] transition-colors font-mono text-sm"
                />
              </div>

              <div className="h-[144px]">
                <label className="text-xs tracking-widest text-white/40 block mb-2">
                  {mode === "text" ? t.secretLabel : t.fileLabel}
                </label>
                <div className="h-[120px]">
                  {mode === "text" ? (
                    <textarea
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      placeholder={t.secretPlaceholder}
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
                          <p className="text-[#FF6B00] font-mono text-sm">
                            {file.name}
                          </p>
                        ) : (
                          <>
                            <p className="text-white/40 text-sm mb-1">{t.dropzone}</p>
                            <p className="text-white/20 text-xs">{t.maxsize}</p>
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
                    {t.views}
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
                    {t.expires}
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
                {t.security.map((note, i) => (
                  <li
                    key={i}
                    className="text-xs text-white/30 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-[#FF6B00] rounded-full" />
                    {note}
                  </li>
                ))}
              </ul>

              <button
                type="submit"
                disabled={!canSubmit || isGenerating}
                className="w-full bg-[#FF6B00] text-black py-3 text-sm tracking-widest font-bold hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isGenerating ? t.generating : t.button}
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
                <p className="text-[#FF6B00] text-sm">{t.success}</p>
              </div>

              <div className="mb-6">
                <p className="text-xs tracking-widest text-white/40 mb-2 invisible">
                  link
                </p>
                <div className="border border-white/10 p-4 bg-white/5 flex items-center gap-3 h-[52px]">
                  <code className="text-sm text-white/80 font-mono flex-1 truncate">
                    {revealed
                      ? generatedLink
                      : "••••••••••••••••••••••••••••••••"}
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
                {copied ? t.copied : t.copy}
              </button>

              <p className="text-xs text-white/20 text-center mb-6">
                {copied ? t.clipboardNote : t.expiresNote}
              </p>

              <button
                type="button"
                onClick={handleReset}
                className="w-full border border-white/10 py-3 text-sm tracking-widest text-white/40 hover:text-white hover:border-white/30 transition-colors"
              >
                {t.newLink}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
