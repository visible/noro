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
  const [lineWidth, setLineWidth] = useState(0);
  const [animate, setAnimate] = useState(false);
  const tagline = t("tagline");

  useEffect(() => {
    const measure = () => {
      if (!bioRef.current) return;
      const text = bioRef.current.firstChild;
      if (!text) return;
      const range = document.createRange();
      range.selectNodeContents(text);
      const rects = range.getClientRects();
      if (rects.length > 0 && rects[0].width > 0) {
        setLineWidth(rects[0].width);
      }
    };

    document.fonts.ready.then(() => {
      measure();
      setTimeout(() => setAnimate(true), 50);
    });

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [tagline]);

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
          <div className="relative">
            <h1 className="text-[12vw] md:text-[10vw] leading-none font-bold tracking-tighter">
              {t("title")}
            </h1>
            <div
              className={`h-1 bg-[#FF6B00] mt-1 ${animate ? "transition-[width] duration-300 ease-out" : ""}`}
              style={{ width: lineWidth > 0 ? lineWidth : "auto" }}
            />
          </div>
        </div>
        <div className="px-4 sm:px-8 md:px-16 pr-16 sm:pr-20 md:pr-8">
          <p
            ref={bioRef}
            className="mt-4 sm:mt-8 text-[3.5vw] md:text-[1.5vw] leading-relaxed text-white/60"
          >
            {tagline}
          </p>
        </div>
      </section>
    </BackgroundBeams>
  );
}
