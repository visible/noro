"use client";

import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import type { Session } from "@/lib/auth";

interface Props {
  session: Session | null;
}

export function Navbar({ session }: Props) {
  return (
    <nav className="fixed top-0 right-0 left-0 z-50 px-6 py-6 transition-all duration-300">
      <div className="flex justify-between items-center mx-auto max-w-6xl">
        <Link href="/" className="flex gap-2 items-center group">
          <div className="text-[#ededed] group-hover:text-[#d4b08c] transition-colors duration-300">
            <Logo />
          </div>
          <span className="font-serif italic text-lg tracking-wide text-[#ededed]">noro</span>
        </Link>
        <div className="hidden gap-8 items-center px-6 py-2 rounded-full border shadow-lg backdrop-blur-md md:flex bg-white/3 border-white/5 shadow-black/20">
          <Link href="/docs" className="text-sm font-medium text-white/60 hover:text-[#d4b08c] transition-colors">Documentation</Link>
          <a href="https://github.com/visible/noro" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white/60 hover:text-[#d4b08c] transition-colors">GitHub</a>
          <Link href={session ? "/vault" : "/login"} className="text-sm font-medium text-white/60 hover:text-[#d4b08c] transition-colors min-w-[72px] text-center">
            {session ? "Open Vault" : "Sign in"}
          </Link>
        </div>
        <div className="md:hidden">
          <div className="w-8 h-8 rounded-full bg-white/10"></div>
        </div>
      </div>
    </nav>
  );
}
