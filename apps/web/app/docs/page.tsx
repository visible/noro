"use client"

import { useState } from "react"
import Link from "next/link"

type Language = "en" | "jp"

const content = {
  en: {
    title: "docs",
    subtitle: "how noro works",
    sections: [
      {
        title: "share via cli",
        items: [
          { code: "npx noro share API_KEY", desc: "share a variable from your .env" },
          { code: "npx noro share API_KEY --ttl=1h", desc: "set expiry: 1h, 6h, 12h, 1d, 7d" },
          { code: "npx noro abc123#key", desc: "claim and auto-add to .env" },
        ],
      },
      {
        title: "share via web",
        items: [
          { code: "noro.sh/share", desc: "create a one-time link" },
          { code: "noro.sh/abc123#key", desc: "view and copy secret" },
        ],
      },
      {
        title: "security",
        items: [
          { code: "AES-256-GCM", desc: "encryption happens in your browser" },
          { code: "key in url fragment", desc: "never sent to server" },
          { code: "one-time claim", desc: "deleted after viewing" },
          { code: "24hr ttl", desc: "expires even if unclaimed" },
        ],
      },
    ],
  },
  jp: {
    title: "ドキュメント",
    subtitle: "noroの仕組み",
    sections: [
      {
        title: "CLIで共有",
        items: [
          { code: "npx noro share API_KEY", desc: ".envから変数を共有" },
          { code: "npx noro share API_KEY --ttl=1h", desc: "有効期限: 1h, 6h, 12h, 1d, 7d" },
          { code: "npx noro abc123#key", desc: "取得して.envに自動追加" },
        ],
      },
      {
        title: "Webで共有",
        items: [
          { code: "noro.sh/share", desc: "ワンタイムリンクを作成" },
          { code: "noro.sh/abc123#key", desc: "シークレットを表示・コピー" },
        ],
      },
      {
        title: "セキュリティ",
        items: [
          { code: "AES-256-GCM", desc: "ブラウザで暗号化" },
          { code: "URLフラグメントにキー", desc: "サーバーに送信されない" },
          { code: "ワンタイム取得", desc: "閲覧後に削除" },
          { code: "24時間TTL", desc: "未取得でも期限切れ" },
        ],
      },
    ],
  },
}

export default function DocsPage() {
  const [lang, setLang] = useState<Language>("en")
  const t = content[lang]

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#FF6B00] selection:text-black">
      <nav className="fixed top-0 right-0 p-8 z-50">
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

      <Link href="/" className="fixed bottom-0 right-0 p-8 z-50 hover:opacity-60 transition-opacity">
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

      <section className="min-h-screen flex items-center justify-center px-8 py-24">
        <div className="w-full max-w-md">
          <div className="mb-16">
            <div className="relative">
              <h1 className="text-4xl font-bold tracking-tighter border-b-4 border-[#FF6B00] inline-block invisible">
                {content.en.title}
              </h1>
              <h1
                className="absolute top-0 left-0 text-4xl font-bold tracking-tighter border-b-4 border-[#FF6B00] transition-opacity duration-200"
                style={{ opacity: lang === "en" ? 1 : 0 }}
              >
                {content.en.title}
              </h1>
              <h1
                className="absolute top-0 left-0 text-4xl font-bold tracking-tighter border-b-4 border-[#FF6B00] transition-opacity duration-200"
                style={{ opacity: lang === "jp" ? 1 : 0 }}
              >
                {content.jp.title}
              </h1>
            </div>
            <div className="relative mt-4">
              <p className="text-white/40 text-sm invisible">{content.en.subtitle}</p>
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

          <div className="space-y-10">
            {t.sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-xs tracking-widest text-white/40 mb-4">{section.title}</h2>
                <div className="space-y-3">
                  {section.items.map((item, j) => (
                    <div key={j} className="border border-white/10 p-4 bg-white/5">
                      <code className="text-sm text-[#FF6B00] font-mono block mb-1">{item.code}</code>
                      <p className="text-xs text-white/40">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <Link
              href="/share"
              className="block w-full text-center bg-[#FF6B00] text-black py-3 text-sm tracking-widest font-bold hover:bg-white transition-colors"
            >
              {lang === "en" ? "try it now" : "試してみる"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
