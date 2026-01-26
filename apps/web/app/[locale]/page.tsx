"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Dock } from "@/components/dock";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/languagetoggle";

const BackgroundBeams = dynamic(
  () => import("@/components/background-beams").then((mod) => mod.BackgroundBeams),
  { ssr: false }
);

function measureFirstLine(element: HTMLElement | null): number {
  if (!element) return 0;
  const text = element.firstChild;
  if (!text || !text.textContent) return 0;

  const range = document.createRange();
  range.setStart(text, 0);
  const fullText = text.textContent;
  const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
  const firstLineBottom = element.getBoundingClientRect().top + lineHeight;

  let end = fullText.length;
  for (let i = 1; i <= fullText.length; i++) {
    range.setEnd(text, i);
    if (range.getBoundingClientRect().bottom > firstLineBottom) {
      end = i - 1;
      break;
    }
  }
  range.setEnd(text, end);
  return range.getBoundingClientRect().width;
}

export default function Home() {
  const t = useTranslations("home");
  const bioRef = useRef<HTMLParagraphElement>(null);
  const [lineWidth, setLineWidth] = useState(200);
  const [ready, setReady] = useState(false);
  const tagline = t("tagline");

  const measure = useCallback(() => {
    const width = measureFirstLine(bioRef.current);
    if (width > 0) {
      setLineWidth(width);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const runMeasure = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(measure);
      });
    };

    if (document.fonts.check("1em sans-serif")) {
      runMeasure();
    }
    document.fonts.ready.then(runMeasure);

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, tagline]);

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
            <motion.div
              className="h-1 bg-[#FF6B00] mt-1"
              initial={false}
              animate={{ width: lineWidth }}
              transition={ready ? { type: "spring", stiffness: 400, damping: 35 } : { duration: 0 }}
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
