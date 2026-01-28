import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: { default: "noro", template: "%s | noro" },
  description: "one-time secret sharing for env vars",
  keywords: ["secrets", "env", "encryption", "cli", "security", "one-time"],
  authors: [{ name: "visible" }],
  creator: "visible",
  metadataBase: new URL("https://noro.sh"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://noro.sh",
    siteName: "noro",
    title: "noro",
    description: "one-time secret sharing for env vars",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "noro" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "noro",
    description: "one-time secret sharing for env vars",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
