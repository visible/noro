import { Analytics } from "@vercel/analytics/next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type React from "react";
import { routing } from "@/i18n/routing";
import { CommandPalette } from "./cmdk";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="font-sans antialiased">
        <NextIntlClientProvider>
          {children}
          <CommandPalette />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
