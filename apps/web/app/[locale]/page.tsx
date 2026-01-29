"use client";

import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { HeroVisual } from "@/components/hero";
import { TerminalVisual } from "@/components/terminal";
import { useSession } from "@/lib/client";

export default function Home() {
  const { data: session, isPending } = useSession();
  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-[#ededed] antialiased selection:bg-[#d4b08c] selection:text-black font-sans relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#0a0a0a]"></div>
        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-white/1" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%221%22/%3E%3C/svg%3E")' }}></div>
      </div>

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
              {isPending ? "" : session ? "Open Vault" : "Sign in"}
            </Link>
          </div>
          <div className="md:hidden">
             <div className="w-8 h-8 rounded-full bg-white/10"></div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="flex flex-col justify-center items-center px-6 py-24 min-h-dvh">
          <div className="max-w-3xl text-center duration-1000 animate-in fade-in slide-in-from-bottom-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4b08c]/10 border border-[#d4b08c]/20 text-xs font-medium text-[#d4b08c] mb-10 tracking-wide uppercase">
              The new standard in privacy
            </div>
            
            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl text-[#ededed] leading-[1.1] mb-8 tracking-tight">
              Quietly <span className="italic text-[#d4b08c]">secure</span> your <br/> digital secrets.
            </h1>
            
            <p className="mx-auto mb-12 max-w-lg text-lg font-light leading-relaxed sm:text-xl text-white/50">
              End-to-end encrypted sharing that leaves no trace. 
              <br className="hidden sm:block"/>
              Designed for developers who value silence.
            </p>
            
            <div className="flex flex-col gap-5 justify-center items-center sm:flex-row">
              <Link 
                href="/share" 
                className="h-14 px-10 inline-flex items-center justify-center text-sm font-medium bg-[#ededed] text-[#0a0a0a] rounded-full hover:bg-[#d4b08c] hover:text-[#0a0a0a] transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(212,176,140,0.3)]"
              >
                Start Sharing
              </Link>
              <div className="font-mono text-sm text-white/30">
                or <span className="text-white/50">npm i -g noro</span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pt-0 pb-24">
          <div className="mx-auto w-full max-w-5xl">
             <HeroVisual />
          </div>
        </section>

        <section className="px-6 py-32">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-[#161616]/80 backdrop-blur-sm border border-white/5 p-8 h-[420px] hover:border-white/10 transition-colors">
                <div className="relative z-10">
                  <h3 className="text-xl font-serif text-[#ededed] mb-3">Zero Knowledge</h3>
                  <p className="text-sm leading-relaxed text-white/50 text-pretty">
                    Your secrets are encrypted client-side using AES-256-GCM before they ever leave your device.
                  </p>
                </div>
                
                <div className="relative mt-8 w-full h-[200px] bg-[#0a0a0a] rounded-lg border border-white/5 overflow-hidden">
                   <div className="flex absolute inset-0 justify-center items-center">
                      <div className="w-full max-w-[200px] space-y-3 p-4">
                        <div className="w-3/4 h-2 rounded animate-pulse bg-white/10"></div>
                        <div className="w-1/2 h-2 rounded delay-75 animate-pulse bg-white/10"></div>
                        <div className="w-full h-2 rounded delay-150 animate-pulse bg-white/5"></div>
                        
                        <div className="mt-6 flex items-center justify-center gap-2 text-[#d4b08c] text-xs font-mono border border-[#d4b08c]/20 bg-[#d4b08c]/5 py-2 rounded">
                           <span className="w-1.5 h-1.5 bg-[#d4b08c] rounded-full animate-pulse"></span>
                           ENCRYPTING...
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-[#161616]/80 backdrop-blur-sm border border-white/5 p-8 h-[420px] hover:border-white/10 transition-colors">
                <div className="relative z-10">
                  <h3 className="text-xl font-serif text-[#ededed] mb-3">Granular Control</h3>
                  <p className="text-sm leading-relaxed text-white/50 text-pretty">
                    Set precise expiration times and view limits. Secrets self-destruct automatically.
                  </p>
                </div>
                
                <div className="relative mt-8 w-full h-[200px] bg-[#0a0a0a] rounded-lg border border-white/5 overflow-hidden">
                   <div className="absolute inset-0 to-transparent opacity-50 bg-linear-to-br from-white/5"></div>
                   
                   <div className="flex absolute inset-0 justify-center items-center p-6">
                      <div className="w-full max-w-[220px] bg-[#1e1e1e] rounded-lg border border-white/10 shadow-2xl overflow-hidden">
                         <div className="p-1 space-y-0.5">
                            <div className="flex justify-between items-center px-3 py-2 rounded cursor-pointer hover:bg-white/5 group/item">
                               <span className="text-sm text-white/80">1 Hour</span>
                               <span className="text-[10px] text-white/40 uppercase tracking-wider">TTL</span>
                            </div>
                            <div className="flex justify-between items-center px-3 py-2 rounded cursor-pointer bg-white/10">
                               <span className="text-sm text-[#d4b08c]">1 Day</span>
                               <span className="text-[10px] text-[#d4b08c]/60 uppercase tracking-wider">Default</span>
                            </div>
                            <div className="flex justify-between items-center px-3 py-2 rounded cursor-pointer hover:bg-white/5 group/item">
                               <span className="text-sm text-white/80">1 Week</span>
                               <span className="text-[10px] text-white/40 uppercase tracking-wider">TTL</span>
                            </div>
                            <div className="my-1 h-px bg-white/5"></div>
                            <div className="flex justify-between items-center px-3 py-2 rounded cursor-pointer hover:bg-white/5 group/item">
                               <span className="text-sm text-white/80">1 View</span>
                               <span className="text-[10px] text-white/40 uppercase tracking-wider">Limit</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-[#161616]/80 backdrop-blur-sm border border-white/5 p-8 h-[420px] hover:border-white/10 transition-colors">
                <div className="relative z-10">
                  <h3 className="text-xl font-serif text-[#ededed] mb-3">Developer Native</h3>
                  <p className="text-sm leading-relaxed text-white/50 text-pretty">
                    Integrate directly into your workflow. Pipe secrets from your terminal or use our SDK.
                  </p>
                </div>
                
                <div className="relative mt-8 w-full h-[200px] bg-[#0a0a0a] rounded-lg border border-white/5 overflow-hidden flex flex-col p-6">
                   <TerminalVisual />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-32">
          <div className="flex flex-col gap-20 justify-between items-center mx-auto max-w-6xl md:flex-row">
            <div className="md:w-1/2">
              <h2 className="font-serif text-4xl sm:text-5xl text-[#ededed] mb-8 leading-tight">
                Seamless <br/> integration.
              </h2>
              <p className="mb-10 max-w-md text-lg leading-relaxed text-white/50">
                Noro lives where you work. Whether it's the command line, your browser, or your desktop.
              </p>
              <ul className="space-y-6">
                {[
                  "Works with any environment variable file (.env)",
                  "Instant clipboard encryption",
                  "Secure file transfer up to 5MB"
                ].map((feature) => (
                  <li key={feature} className="flex gap-4 items-center text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4b08c]"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-1/2">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-4 translate-y-8">
                   <div className="aspect-4/5 rounded-2xl bg-[#161616] border border-white/5 p-6 flex flex-col justify-end hover:border-white/10 transition-colors group">
                      <span className="font-mono text-xs text-[#d4b08c]">CLI</span>
                      <h4 className="mt-2 text-lg font-medium transition-colors group-hover:text-white">Terminal</h4>
                   </div>
                   <div className="flex flex-col justify-end p-6 rounded-2xl border transition-colors aspect-square bg-white/3 border-white/5 hover:border-white/10 group">
                      <span className="font-mono text-xs text-white/40 group-hover:text-[#d4b08c] transition-colors">API</span>
                      <h4 className="mt-2 text-lg font-medium transition-colors group-hover:text-white">SDK</h4>
                   </div>
                 </div>
                 <div className="space-y-4">
                   <div className="flex flex-col justify-end p-6 rounded-2xl border transition-colors aspect-square bg-white/3 border-white/5 hover:border-white/10 group">
                      <span className="font-mono text-xs text-white/40 group-hover:text-[#d4b08c] transition-colors">GUI</span>
                      <h4 className="mt-2 text-lg font-medium transition-colors group-hover:text-white">Desktop</h4>
                   </div>
                   <div className="aspect-4/5 rounded-2xl bg-[#161616] border border-white/5 p-6 flex flex-col justify-end hover:border-white/10 transition-colors group">
                      <span className="font-mono text-xs text-[#d4b08c]">WEB</span>
                      <h4 className="mt-2 text-lg font-medium transition-colors group-hover:text-white">Extension</h4>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-40 text-center">
          <div>
            <h2 className="font-serif text-5xl sm:text-6xl text-[#ededed] mb-10">
              Leave no trace.
            </h2>
            <Link 
              href="/share" 
              className="text-[#d4b08c] hover:text-white transition-colors border-b border-[#d4b08c]/30 hover:border-white pb-1 text-lg"
            >
              Start sharing securely →
            </Link>
          </div>
        </section>
      </main>

      <footer className="overflow-hidden relative z-10 px-6 py-12">
        <div className="flex flex-col gap-8 justify-between items-center mx-auto max-w-6xl md:flex-row">
          <div className="flex gap-3 items-center opacity-50 transition-opacity hover:opacity-100">
            <Logo />
            <span className="font-mono text-xs tracking-widest uppercase">Visible / Noro</span>
          </div>
          <div className="flex gap-8 text-sm text-white/30">
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
            <a href="mailto:hello@noro.sh" className="transition-colors hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
