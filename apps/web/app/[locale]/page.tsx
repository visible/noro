"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { Dock } from "@/components/dock";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/languagetoggle";

const BackgroundBeams = dynamic(
  () => import("@/components/background-beams").then((mod) => mod.BackgroundBeams),
  { ssr: false }
);

export default function Home() {
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <BackgroundBeams className="text-white selection:bg-[#FF6B00] selection:text-black">
      <Dock />
      <LanguageToggle />
      <Link
        href="/"
        className="fixed bottom-0 right-0 p-8 z-50 hover:opacity-60 transition-opacity"
      >
        <Logo />
      </Link>

      <section className="absolute inset-0 z-10">
        <div className="h-1/2 flex flex-col justify-end px-4 sm:px-8 md:px-16 pr-16 sm:pr-20 md:pr-8">
          <h1 className="text-[12vw] md:text-[10vw] leading-none font-bold tracking-tighter border-b-4 border-[#FF6B00] w-fit pr-48">
            {t("title")}
          </h1>
        </div>
        <div className="px-4 sm:px-8 md:px-16 pr-16 sm:pr-20 md:pr-8">
          <p className="mt-4 sm:mt-8 text-sm sm:text-lg md:text-xl leading-relaxed max-w-xs sm:max-w-xl text-white/60">
            {t("tagline")}
          </p>
        </div>
      </section>
    </BackgroundBeams>
  );
}
