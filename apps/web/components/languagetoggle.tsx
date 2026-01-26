"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 right-0 p-4 sm:p-8 z-50">
      <div className="flex items-center gap-2 text-xs tracking-widest">
        <Link
          href={pathname}
          locale="en"
          className={locale === "en" ? "text-[#FF6B00]" : "text-white/30 hover:text-white"}
        >
          EN
        </Link>
        <span className="text-white/20">/</span>
        <Link
          href={pathname}
          locale="ja"
          className={locale === "ja" ? "text-[#FF6B00]" : "text-white/30 hover:text-white"}
        >
          JA
        </Link>
      </div>
    </nav>
  );
}
