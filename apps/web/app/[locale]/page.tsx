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
          <div className="w-fit border-b-4 border-[#FF6B00]">
            <h1 className="text-[12vw] md:text-[10vw] leading-none font-bold tracking-tighter">
              {t("title")}
            </h1>
            <p className="mt-4 sm:mt-8 text-[3.5vw] md:text-[1.5vw] leading-relaxed text-white/60 line-clamp-1 invisible">
              {t("tagline")}
            </p>
          </div>
        </div>
        <div className="px-4 sm:px-8 md:px-16 pr-16 sm:pr-20 md:pr-8 -mt-[calc(3.5vw+1rem)] md:-mt-[calc(1.5vw+2rem)]">
          <p className="text-[3.5vw] md:text-[1.5vw] leading-relaxed text-white/60">
            {t("tagline")}
          </p>
        </div>
      </section>
    </BackgroundBeams>
  );
}
