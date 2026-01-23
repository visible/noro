"use client"

import { useState } from "react"
import Link from "next/link"

type Language = "en" | "jp"
type Section = "cli" | "web" | "desktop" | "extension"

const nav = {
  en: [
    { id: "cli" as Section, label: "cli" },
    { id: "web" as Section, label: "website" },
    { id: "desktop" as Section, label: "desktop" },
    { id: "extension" as Section, label: "extension" },
  ],
  jp: [
    { id: "cli" as Section, label: "CLI" },
    { id: "web" as Section, label: "ウェブサイト" },
    { id: "desktop" as Section, label: "デスクトップ" },
    { id: "extension" as Section, label: "拡張機能" },
  ],
}

const content = {
  en: {
    cli: {
      title: "command line",
      sections: [
        {
          title: "share a secret",
          items: [
            { code: "npx noro share API_KEY", desc: null },
            { code: null, desc: "generates a one-time link like noro.sh/x7k#key" },
            { code: null, desc: "encrypted client-side before upload" },
          ],
        },
        {
          title: "set expiry",
          items: [
            { code: "npx noro share API_KEY --ttl=1h", desc: null },
            { code: null, desc: "options: 1h, 6h, 12h, 1d (default), 7d" },
          ],
        },
        {
          title: "claim a secret",
          items: [
            { code: "npx noro x7k#key", desc: null },
            { code: null, desc: "auto-adds to .env or .env.local" },
            { code: null, desc: "link destroyed after claiming" },
          ],
        },
        {
          title: "security",
          items: [
            { code: null, desc: "AES-256-GCM encryption" },
            { code: null, desc: "key stays in URL fragment (never sent to server)" },
            { code: null, desc: "zero-knowledge architecture" },
          ],
        },
      ],
    },
    web: {
      title: "website",
      sections: [
        {
          title: "create a link",
          items: [
            { code: "noro.sh/share", desc: null },
            { code: null, desc: "paste your secret and generate a one-time link" },
            { code: null, desc: "same encryption as CLI" },
          ],
        },
        {
          title: "view a secret",
          items: [
            { code: "noro.sh/x7k#key", desc: null },
            { code: null, desc: "view and copy the secret" },
            { code: null, desc: "hidden by default for screen sharing" },
          ],
        },
        {
          title: "no account required",
          items: [
            { code: null, desc: "no sign up, no login" },
            { code: null, desc: "completely anonymous" },
            { code: null, desc: "we never see your data" },
          ],
        },
      ],
    },
    desktop: {
      title: "desktop app",
      sections: [
        {
          title: "coming soon",
          items: [
            { code: null, desc: "secure password manager" },
            { code: null, desc: "OTP authenticator built-in" },
            { code: null, desc: "encrypted notes and secrets" },
          ],
        },
        {
          title: "features",
          items: [
            { code: null, desc: "local-first, encrypted storage" },
            { code: null, desc: "optional cloud sync across devices" },
            { code: null, desc: "biometric unlock" },
            { code: null, desc: "auto-fill for apps and browsers" },
          ],
        },
        {
          title: "platforms",
          items: [
            { code: null, desc: "macOS" },
            { code: null, desc: "Windows" },
            { code: null, desc: "Linux" },
          ],
        },
      ],
    },
    extension: {
      title: "browser extension",
      sections: [
        {
          title: "coming soon",
          items: [
            { code: null, desc: "auto-fill passwords and logins" },
            { code: null, desc: "generate secure passwords" },
            { code: null, desc: "OTP auto-fill" },
          ],
        },
        {
          title: "sync everywhere",
          items: [
            { code: null, desc: "syncs with desktop app" },
            { code: null, desc: "access from any browser" },
            { code: null, desc: "works on mobile browsers" },
          ],
        },
        {
          title: "browsers",
          items: [
            { code: null, desc: "Chrome" },
            { code: null, desc: "Firefox" },
            { code: null, desc: "Safari" },
            { code: null, desc: "Edge" },
          ],
        },
      ],
    },
  },
  jp: {
    cli: {
      title: "コマンドライン",
      sections: [
        {
          title: "シークレットを共有",
          items: [
            { code: "npx noro share API_KEY", desc: null },
            { code: null, desc: "noro.sh/x7k#keyのようなワンタイムリンクを生成" },
            { code: null, desc: "アップロード前にクライアント側で暗号化" },
          ],
        },
        {
          title: "有効期限を設定",
          items: [
            { code: "npx noro share API_KEY --ttl=1h", desc: null },
            { code: null, desc: "オプション: 1h, 6h, 12h, 1d (デフォルト), 7d" },
          ],
        },
        {
          title: "シークレットを取得",
          items: [
            { code: "npx noro x7k#key", desc: null },
            { code: null, desc: ".envまたは.env.localに自動追加" },
            { code: null, desc: "取得後にリンクは削除" },
          ],
        },
        {
          title: "セキュリティ",
          items: [
            { code: null, desc: "AES-256-GCM暗号化" },
            { code: null, desc: "キーはURLフラグメントに保持（サーバーに送信されない）" },
            { code: null, desc: "ゼロ知識アーキテクチャ" },
          ],
        },
      ],
    },
    web: {
      title: "ウェブサイト",
      sections: [
        {
          title: "リンクを作成",
          items: [
            { code: "noro.sh/share", desc: null },
            { code: null, desc: "シークレットを貼り付けてワンタイムリンクを生成" },
            { code: null, desc: "CLIと同じ暗号化" },
          ],
        },
        {
          title: "シークレットを表示",
          items: [
            { code: "noro.sh/x7k#key", desc: null },
            { code: null, desc: "シークレットを表示・コピー" },
            { code: null, desc: "画面共有用にデフォルトで非表示" },
          ],
        },
        {
          title: "アカウント不要",
          items: [
            { code: null, desc: "サインアップ不要、ログイン不要" },
            { code: null, desc: "完全に匿名" },
            { code: null, desc: "データは一切見えない" },
          ],
        },
      ],
    },
    desktop: {
      title: "デスクトップアプリ",
      sections: [
        {
          title: "近日公開",
          items: [
            { code: null, desc: "安全なパスワードマネージャー" },
            { code: null, desc: "OTP認証機能内蔵" },
            { code: null, desc: "暗号化されたメモとシークレット" },
          ],
        },
        {
          title: "機能",
          items: [
            { code: null, desc: "ローカルファースト、暗号化ストレージ" },
            { code: null, desc: "デバイス間のクラウド同期（オプション）" },
            { code: null, desc: "生体認証でロック解除" },
            { code: null, desc: "アプリとブラウザの自動入力" },
          ],
        },
        {
          title: "プラットフォーム",
          items: [
            { code: null, desc: "macOS" },
            { code: null, desc: "Windows" },
            { code: null, desc: "Linux" },
          ],
        },
      ],
    },
    extension: {
      title: "ブラウザ拡張機能",
      sections: [
        {
          title: "近日公開",
          items: [
            { code: null, desc: "パスワードとログインの自動入力" },
            { code: null, desc: "安全なパスワード生成" },
            { code: null, desc: "OTP自動入力" },
          ],
        },
        {
          title: "どこでも同期",
          items: [
            { code: null, desc: "デスクトップアプリと同期" },
            { code: null, desc: "どのブラウザからもアクセス" },
            { code: null, desc: "モバイルブラウザでも動作" },
          ],
        },
        {
          title: "ブラウザ",
          items: [
            { code: null, desc: "Chrome" },
            { code: null, desc: "Firefox" },
            { code: null, desc: "Safari" },
            { code: null, desc: "Edge" },
          ],
        },
      ],
    },
  },
}

export default function DocsPage() {
  const [lang, setLang] = useState<Language>("en")
  const [section, setSection] = useState<Section>("cli")
  const t = content[lang][section]
  const navItems = nav[lang]

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

      <div className="flex min-h-screen">
        <aside className="fixed left-0 top-0 h-full w-48 p-12 pt-24 flex flex-col border-r border-white/5">
          <h1 className="text-lg font-bold tracking-tight mb-12">
            <span className="text-[#FF6B00]">noro</span>
            <span className="text-white/30"> / docs</span>
          </h1>
          <nav className="space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`block text-sm tracking-wide transition-colors text-left ${
                  section === item.id ? "text-white" : "text-white/30 hover:text-white/60"
                }`}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 ml-48 p-12 pt-24">
          <div className="max-w-2xl">
            <div className="space-y-16">
              {t.sections.map((sec, i) => (
                <section key={i}>
                  <h2 className="text-xs tracking-widest text-[#FF6B00] mb-6">{sec.title}</h2>
                  <div className="space-y-3 pl-4 border-l border-white/10">
                    {sec.items.map((item, j) => (
                      <div key={j}>
                        {item.code && (
                          <code className="text-white font-mono text-sm">{item.code}</code>
                        )}
                        {item.desc && (
                          <p className="text-white/40 text-sm">{item.desc}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
