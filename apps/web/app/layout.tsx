import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "noro",
  description: "share env vars with one command",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#e5e5e5",
        fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
      }}>
        {children}
      </body>
    </html>
  )
}
