"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const STEPS = [
  { text: "Reading .env.local...", color: "text-white/40" },
  { text: "Found DATABASE_URL", color: "text-white/60" },
  { text: "Encrypting (AES-256-GCM)...", color: "text-[#d4b08c]/80" },
  { text: "Uploading to secure storage...", color: "text-white/40" },
  { text: "Link created", color: "text-green-400" },
];

export function DeveloperNativeVisual() {
  const [stepIndex, setStepIndex] = useState(-1);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const loop = async () => {
      // Reset
      setStepIndex(-1);
      setShowResult(false);
      
      // Start steps after a delay
      await new Promise(r => setTimeout(r, 1000));
      
      for (let i = 0; i < STEPS.length; i++) {
        setStepIndex(i);
        await new Promise(r => setTimeout(r, 800));
      }
      
      setShowResult(true);
      
      // Hold then restart
      await new Promise(r => setTimeout(r, 4000));
      loop();
    };
    
    loop();
  }, []);

  return (
    <div className="flex relative flex-col justify-center w-full h-full">
      {/* Input / Command Bar */}
      <div className="relative z-20 bg-[#222] border border-white/5 rounded-lg p-3 mb-4 shadow-lg overflow-hidden">
         <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/2 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
         <div className="flex gap-2 items-center">
            <span className="text-[#d4b08c] font-mono text-xs">$</span>
            <span className="font-mono text-sm text-white/90">noro share DATABASE_URL</span>
            <span className="w-1.5 h-4 bg-white/40 animate-blink"></span>
         </div>
      </div>

      {/* Steps List */}
      <div className="space-y-2 pl-1 min-h-[140px]">
         <AnimatePresence mode="popLayout">
            {STEPS.map((step, i) => (
               i <= stepIndex && (
                 <motion.div
                   key={step.text}
                   initial={{ opacity: 0, x: -10, height: 0 }}
                   animate={{ opacity: 1, x: 0, height: "auto" }}
                   exit={{ opacity: 0 }}
                   className={`text-xs font-mono flex items-center gap-2 ${step.color}`}
                 >
                    <span className="w-1 h-1 bg-current rounded-full opacity-50"></span>
                    {step.text}
                 </motion.div>
               )
            ))}
            
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative p-3 mt-4 font-mono text-xs break-all rounded border transition-colors cursor-pointer bg-white/5 border-white/5 text-white/70 group/link hover:bg-white/10"
              >
                 <div className="absolute -inset-px bg-[#d4b08c] opacity-0 group-hover/link:opacity-20 blur-sm transition-opacity rounded"></div>
                 <span className="relative">noro.sh/s/8f92...#key</span>
                 <div className="absolute right-2 top-1/2 opacity-0 transition-opacity -translate-y-1/2 group-hover/link:opacity-100">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                       <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                       <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
