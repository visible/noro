"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const locales = ["en", "ja", "ko", "zh"] as const;
const labels: Record<string, string> = { en: "EN", ja: "JA", ko: "KO", zh: "ZH" };

export function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const currentIndex = locales.indexOf(locale as (typeof locales)[number]);
  const nextLocale = locales[(currentIndex + 1) % locales.length];

  return (
    <nav className="fixed top-0 right-0 p-4 sm:p-8 z-50">
      <div className="flex items-center gap-2 text-xs tracking-widest">
        <span className="text-[#FF6B00]">{labels[locale]}</span>
        <span className="text-white/20">/</span>
        <Link
          href={pathname}
          locale={nextLocale}
          className="text-white/30 hover:text-white"
        >
          {labels[nextLocale]}
        </Link>
      </div>
    </nav>
  );
}
