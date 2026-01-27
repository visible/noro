"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Dock } from "@/components/dock";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/languagetoggle";

const BackgroundBeams = dynamic(
  () => import("@/components/background-beams").then((mod) => mod.BackgroundBeams),
  { ssr: false }
);

export default function Home() {
  const t = useTranslations("home");

  return (
    <BackgroundBeams className="text-white selection:bg-[#FF6B00] selection:text-black">
      <Dock />
      <LanguageToggle />
      <nav className="fixed top-0 left-0 p-6 md:p-8 z-50 flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm font-medium text-white/70 hover:text-white transition-colors"
        >
          login
        </Link>
        <Link
          href="/register"
          className="text-sm font-medium px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          register
        </Link>
      </nav>
      <Link
        href="/"
        className="fixed bottom-0 right-0 p-8 z-50 hover:opacity-60 transition-opacity"
      >
        <Logo />
      </Link>

      <section className="absolute inset-0 z-10">
        <div className="h-1/2 flex flex-col justify-end px-4 sm:px-8 md:px-16 pr-16 sm:pr-20 md:pr-8">
          <h1 className="text-[12vw] md:text-[10vw] leading-none font-bold tracking-tighter border-b-4 border-[#FF6B00] w-fit pr-24">
            {t("title")}
          </h1>
        </div>
        <div className="px-4 sm:px-8 md:px-16 pr-16 sm:pr-20 md:pr-8">
          <p className="mt-4 sm:mt-8 text-[3.5vw] md:text-[1.5vw] leading-relaxed text-white/60">
            {t("tagline")}
          </p>
        </div>
      </section>
    </BackgroundBeams>
  );
}
