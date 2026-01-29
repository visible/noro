"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function HeroVisual() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto py-20 px-6 relative">
      <div className="absolute top-10 left-6 z-30">
        <h4 className="font-serif text-2xl text-[#ededed] mb-2">Secure Architecture</h4>
        <p className="text-sm text-white/50 max-w-[200px] leading-relaxed">
          How noro protects your secrets from end to end.
        </p>
      </div>

      <div className="relative flex items-center justify-center min-h-[600px]">
        <div className="relative z-20">
          <div className="relative w-[320px] h-[160px] rounded-full border border-white/5 bg-[#0a0a0a] overflow-hidden flex items-center justify-center group shadow-2xl">
            <div className="absolute inset-0 bg-[#d4b08c] opacity-[0.03] blur-3xl group-hover:opacity-[0.05] transition-opacity duration-1000"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)] opacity-50"></div>
            <div className="relative z-10 text-center">
              <h3 className="font-serif text-3xl text-[#ededed] tracking-tight">Secure Enclave</h3>
              <p className="text-xs text-[#d4b08c] uppercase tracking-widest mt-2 font-medium opacity-80">AES-256-GCM</p>
            </div>
            <div className="absolute -inset-px border border-white/5 rounded-full"></div>
            <div className="absolute inset-[-12px] border border-dashed border-white/5 rounded-full animate-[spin_60s_linear_infinite] opacity-30"></div>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[5%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-6">
            <div className={`px-6 py-3 rounded-full bg-[#161616] border transition-all duration-700 ${step === 0 ? 'border-[#d4b08c] shadow-[0_0_20px_rgba(212,176,140,0.15)] scale-110' : 'border-white/5 opacity-50'}`}>
              <span className="text-base font-medium text-white/90">Secret Input</span>
            </div>
            <div className={`h-24 w-px bg-linear-to-b from-white/10 to-transparent relative overflow-hidden`}>
               {step === 0 && (
                 <motion.div
                   layoutId="packet-1"
                   className="absolute top-0 left-0 w-full h-1/2 bg-[#d4b08c]"
                   initial={{ y: -60 }}
                   animate={{ y: 120 }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                 />
               )}
            </div>
          </div>

          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-row items-center gap-6">
            <div className={`px-6 py-3 rounded-full bg-[#161616] border transition-all duration-700 ${step === 1 ? 'border-[#d4b08c] shadow-[0_0_20px_rgba(212,176,140,0.15)] scale-110' : 'border-white/5 opacity-50'}`}>
              <span className="text-base font-medium text-white/90">Client-Side Key</span>
            </div>
            <div className="w-24 h-px bg-linear-to-r from-white/10 to-transparent relative overflow-hidden">
               {step === 1 && (
                 <motion.div
                   layoutId="packet-2"
                   className="absolute top-0 left-0 h-full w-1/2 bg-[#d4b08c]"
                   initial={{ x: -60 }}
                   animate={{ x: 120 }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                 />
               )}
            </div>
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-row-reverse items-center gap-6">
            <div className={`px-6 py-3 rounded-full bg-[#161616] border transition-all duration-700 ${step === 2 ? 'border-[#d4b08c] shadow-[0_0_20px_rgba(212,176,140,0.15)] scale-110' : 'border-white/5 opacity-50'}`}>
              <span className="text-base font-medium text-white/90">Redis (Encrypted)</span>
            </div>
            <div className="w-24 h-px bg-linear-to-l from-white/10 to-transparent relative overflow-hidden">
               {step === 2 && (
                 <motion.div
                   layoutId="packet-3"
                   className="absolute top-0 right-0 h-full w-1/2 bg-[#d4b08c]"
                   initial={{ x: 60 }}
                   animate={{ x: -120 }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                 />
               )}
            </div>
          </div>

          <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-6">
            <div className="px-6 py-3 rounded-full bg-[#161616] border border-white/5 opacity-50">
              <span className="text-base font-medium text-white/90">Auto-Destruct</span>
            </div>
            <div className="h-24 w-px bg-linear-to-t from-white/10 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
