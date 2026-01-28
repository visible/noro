"use client";

import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-[#ededed] antialiased selection:bg-[#d4b08c] selection:text-black font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Misty Top Glow */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[140%] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(212,176,140,0.08),transparent_70%)] blur-[80px]"></div>
        {/* Subtle Noise Texture (optional, simulated with opacity) */}
        <div className="absolute inset-0 bg-white/1 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%221%22/%3E%3C/svg%3E")' }}></div>
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 transition-all duration-300">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
             {/* Logo updated to be more subtle/classy */}
            <div className="text-[#ededed] group-hover:text-[#d4b08c] transition-colors duration-300">
              <Logo />
            </div>
            <span className="font-serif italic text-lg tracking-wide text-[#ededed]">noro</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 bg-white/3 backdrop-blur-md px-6 py-2 rounded-full border border-white/5 shadow-lg shadow-black/20">
            <Link href="/docs" className="text-sm font-medium text-white/60 hover:text-[#d4b08c] transition-colors">Documentation</Link>
            <a href="https://github.com/visible/noro" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white/60 hover:text-[#d4b08c] transition-colors">GitHub</a>
            <Link href="/login" className="text-sm font-medium text-white/60 hover:text-[#d4b08c] transition-colors">Sign in</Link>
          </div>
          <div className="md:hidden">
             {/* Mobile Menu Placeholder */}
             <div className="w-8 h-8 rounded-full bg-white/10"></div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[90dvh] flex flex-col items-center justify-center px-6 pt-20 pb-32">
          <div className="text-center max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4b08c]/10 border border-[#d4b08c]/20 text-xs font-medium text-[#d4b08c] mb-10 tracking-wide uppercase">
              The new standard in privacy
            </div>
            
            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl text-[#ededed] leading-[1.1] mb-8 tracking-tight">
              Quietly <span className="italic text-[#d4b08c]">secure</span> your <br/> digital secrets.
            </h1>
            
            <p className="text-lg sm:text-xl text-white/50 leading-relaxed max-w-lg mx-auto mb-12 font-light">
              End-to-end encrypted sharing that leaves no trace. 
              <br className="hidden sm:block"/>
              Designed for developers who value silence.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link 
                href="/share" 
                className="h-14 px-10 inline-flex items-center justify-center text-sm font-medium bg-[#ededed] text-[#0a0a0a] rounded-full hover:bg-[#d4b08c] hover:text-[#0a0a0a] transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(212,176,140,0.3)]"
              >
                Start Sharing
              </Link>
              <div className="text-sm text-white/30 font-mono">
                or <span className="text-white/50">npm i -g noro</span>
              </div>
            </div>
          </div>

          {/* Hero Visual - Abstract Landscape/Terminal Hybrid */}
          <div className="mt-20 w-full max-w-5xl mx-auto relative group perspective-1000">
             {/* Glow behind container */}
             <div className="absolute inset-0 bg-[#d4b08c] opacity-[0.03] blur-[100px] rounded-full"></div>
             
             <div className="relative bg-[#121212] rounded-xl border border-white/5 overflow-hidden shadow-2xl transition-transform duration-700 ease-out group-hover:scale-[1.01] group-hover:shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
               {/* Window Controls */}
               <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#161616]">
                 <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-[#3a3a3a]"></div>
                   <div className="w-3 h-3 rounded-full bg-[#3a3a3a]"></div>
                   <div className="w-3 h-3 rounded-full bg-[#3a3a3a]"></div>
                 </div>
                 <div className="text-[10px] uppercase tracking-widest text-white/20 font-medium">Encrypted Session</div>
                 <div className="w-12"></div>
               </div>

               {/* Interface */}
               <div className="grid md:grid-cols-2 min-h-[400px]">
                 {/* Left: Input */}
                 <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-center">
                    <div className="block text-xs font-medium text-[#d4b08c] mb-4 uppercase tracking-wider">Secret Payload</div>
                    <div className="font-mono text-sm text-white/80 leading-relaxed">
                      <span className="text-purple-400">const</span> <span className="text-blue-400">apiKey</span> = <span className="text-green-400">"sk_live_..."</span>
                      <span className="text-white/60">;</span>
                      <br/><br/>
                      <span className="text-white/40">{'//'} This secret will self-destruct</span>
                      <br/>
                      <span className="text-white/40">{'//'} after 1 view or 24 hours.</span>
                    </div>
                 </div>

                 {/* Right: Output/Visual */}
                 <div className="relative bg-[#0a0a0a] p-8 md:p-12 flex flex-col items-center justify-center overflow-hidden">
                    {/* Abstract encryption visual */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,176,140,0.05),transparent_60%)]"></div>
                    
                    <div className="relative z-10 w-full max-w-[240px] aspect-square rounded-full border border-white/10 flex items-center justify-center animate-[spin_60s_linear_infinite]">
                      <div className="w-[80%] h-[80%] rounded-full border border-dashed border-white/20 animate-[spin_40s_linear_infinite_reverse]"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-[#d4b08c] rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <div className="w-2 h-2 bg-[#d4b08c] rounded-full shadow-[0_0_20px_#d4b08c]"></div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-8 text-center">
                       <div className="text-xs font-mono text-white/30">AES-256-GCM ENCRYPTED</div>
                    </div>
                 </div>
               </div>
             </div>
          </div>
        </section>

        {/* Features - "Misty Cards" */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Ephemeral by Design",
                  desc: "Secrets are not just hidden, they are destroyed. Once viewed, the data ceases to exist on our servers.",
                  icon: (
                    <svg className="w-6 h-6 text-[#d4b08c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                },
                {
                  title: "Client-Side Only",
                  desc: "Encryption happens in your browser. We never see the key, and we can't decrypt your data even if compelled.",
                  icon: (
                    <svg className="w-6 h-6 text-[#d4b08c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )
                },
                {
                  title: "Terminal Native",
                  desc: "Built for the CLI. Pipe secrets directly from your environment without leaving your workflow.",
                  icon: (
                    <svg className="w-6 h-6 text-[#d4b08c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )
                }
              ].map((item) => (
                <div key={item.title} className="group p-10 rounded-2xl bg-white/2 border border-white/3 hover:bg-white/4 transition-all duration-500 hover:-translate-y-1">
                  <div className="mb-6 opacity-80 group-hover:opacity-100 transition-opacity">{item.icon}</div>
                  <h3 className="text-xl font-serif text-[#ededed] mb-4">{item.title}</h3>
                  <p className="text-sm text-white/50 leading-loose">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Section */}
        <section className="py-32 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-20">
            <div className="md:w-1/2">
              <h2 className="font-serif text-4xl sm:text-5xl text-[#ededed] mb-8 leading-tight">
                Seamless <br/> integration.
              </h2>
              <p className="text-white/50 leading-relaxed text-lg mb-10 max-w-md">
                Noro lives where you work. Whether it's the command line, your browser, or your desktop.
              </p>
              <ul className="space-y-6">
                {[
                  "Works with any environment variable file (.env)",
                  "Instant clipboard encryption",
                  "Secure file transfer up to 5MB"
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-4 text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4b08c]"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 w-full">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-4 translate-y-8">
                   <div className="aspect-4/5 rounded-2xl bg-[#161616] border border-white/5 p-6 flex flex-col justify-end">
                      <span className="font-mono text-xs text-[#d4b08c]">CLI</span>
                      <h4 className="text-lg font-medium mt-2">Terminal</h4>
                   </div>
                   <div className="aspect-square rounded-2xl bg-white/3 border border-white/5 p-6 flex flex-col justify-end">
                      <span className="font-mono text-xs text-white/40">API</span>
                      <h4 className="text-lg font-medium mt-2">SDK</h4>
                   </div>
                 </div>
                 <div className="space-y-4">
                   <div className="aspect-square rounded-2xl bg-white/3 border border-white/5 p-6 flex flex-col justify-end">
                      <span className="font-mono text-xs text-white/40">GUI</span>
                      <h4 className="text-lg font-medium mt-2">Desktop</h4>
                   </div>
                   <div className="aspect-4/5 rounded-2xl bg-[#161616] border border-white/5 p-6 flex flex-col justify-end">
                      <span className="font-mono text-xs text-[#d4b08c]">WEB</span>
                      <h4 className="text-lg font-medium mt-2">Extension</h4>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-40 px-6 text-center">
          <h2 className="font-serif text-5xl sm:text-6xl text-[#ededed] mb-10">
            Leave no trace.
          </h2>
          <Link 
            href="/share" 
            className="text-[#d4b08c] hover:text-white transition-colors border-b border-[#d4b08c]/30 hover:border-white pb-1 text-lg"
          >
            Start sharing securely →
          </Link>
        </section>
      </main>

      <footer className="border-t border-white/5 px-6 py-12 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
            <Logo />
            <span className="text-xs font-mono tracking-widest uppercase">Visible / Noro</span>
          </div>
          <div className="flex gap-8 text-sm text-white/30">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:hello@noro.sh" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
