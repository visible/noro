"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
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
  const bioRef = useRef<HTMLParagraphElement>(null);
  const [lineWidth, setLineWidth] = useState<number | null>(null);

  useEffect(() => {
    const measure = () => {
      if (!bioRef.current) return;
      const range = document.createRange();
      const text = bioRef.current.firstChild;
      if (!text) return;
      range.setStart(text, 0);
      const fullText = text.textContent || "";
      let end = fullText.length;
      range.setEnd(text, end);
      const lineHeight = parseFloat(getComputedStyle(bioRef.current).lineHeight);
      const firstLineBottom = bioRef.current.getBoundingClientRect().top + lineHeight;
      for (let i = 1; i <= fullText.length; i++) {
        range.setEnd(text, i);
        const rect = range.getBoundingClientRect();
        if (rect.bottom > firstLineBottom) {
          end = i - 1;
          break;
        }
      }
      range.setEnd(text, end);
      setLineWidth(range.getBoundingClientRect().width);
    };
    document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

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
          <h1
            className="text-[12vw] md:text-[10vw] leading-none font-bold tracking-tighter border-b-4 border-[#FF6B00]"
            style={{ width: lineWidth ? `${lineWidth}px` : "fit-content" }}
          >
            {t("title")}
          </h1>
        </div>
        <div className="px-4 sm:px-8 md:px-16 pr-16 sm:pr-20 md:pr-8">
          <p
            ref={bioRef}
            className="mt-4 sm:mt-8 text-[3.5vw] md:text-[1.5vw] leading-relaxed text-white/60"
          >
            {t("tagline")}
          </p>
        </div>
      </section>
    </BackgroundBeams>
  );
}
