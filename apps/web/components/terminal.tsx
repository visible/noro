"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export function TerminalVisual() {
  const [activeStep, setActiveStep] = useState(0);
  const [isLanded, setIsLanded] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const ROW_HEIGHT = 48;
  const TRAVEL_DURATION = 0.6;
  const GLOW_DURATION = 0.35;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        const next = prev === 3 ? 0 : prev + 1;
        const isReset = next === 0;

        if (isReset) {
          setIsLanded(true);
        } else {
          setIsLanded(false);
          timeoutRef.current = setTimeout(() => {
            setIsLanded(true);
          }, TRAVEL_DURATION * 1000);
        }

        return next;
      });
    }, 2200);

    return () => {
      clearInterval(timer);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const steps = [
    { label: "Read .env", value: "24KB" },
    { label: "Encrypt", value: "AES-GCM" },
    { label: "Upload", value: "120ms" },
    { label: "Link Ready", value: "noro.sh/..." },
  ];

  const isResetting = activeStep === 0;

  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="relative w-full max-w-[200px]">
        <div className="absolute left-2 top-6 bottom-6 w-px -translate-x-1/2 bg-white/5" />

        <motion.div
          className="absolute left-2 top-6 w-px -translate-x-1/2 bg-[#d4b08c]/20"
          animate={{ height: activeStep * ROW_HEIGHT }}
          transition={{
            duration: isResetting ? 0 : TRAVEL_DURATION,
            ease: [0.4, 0, 0.2, 1]
          }}
        />

        <div className="flex flex-col">
          {steps.map((step, i) => {
            const isActive = i === activeStep;
            const isCompleted = i < activeStep;
            const showGlow = isActive && isLanded;
            const isHighlighted = isActive || isCompleted;

            return (
              <div
                key={step.label}
                className="flex relative gap-4 items-center"
                style={{ height: ROW_HEIGHT }}
              >
                <div className="flex relative z-10 justify-center items-center w-4 h-4 shrink-0">
                  <motion.div
                    className="relative w-1.5 h-1.5 rounded-full"
                    animate={{
                      scale: showGlow ? 1.25 : 1,
                      backgroundColor: showGlow ? "#d4b08c" : "#0a0a0a",
                      boxShadow: isHighlighted
                        ? "inset 0 0 0 1px #d4b08c"
                        : "inset 0 0 0 1px rgba(255,255,255,0.1)",
                    }}
                    transition={{
                      duration: GLOW_DURATION,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {showGlow && (
                        <motion.div
                          key="glow"
                          className="absolute inset-[-6px] rounded-full bg-[#d4b08c]"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 0.4, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{
                            duration: GLOW_DURATION,
                            ease: [0.22, 1, 0.36, 1]
                          }}
                          style={{ filter: "blur(6px)" }}
                        />
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {isCompleted && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-[#d4b08c]/50"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                <motion.div
                  className="flex flex-1 justify-between items-center"
                  animate={{
                    opacity: isHighlighted ? 1 : 0.3,
                    x: isHighlighted ? 0 : -4
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  <span className="text-xs font-medium text-[#ededed] font-sans">
                    {step.label}
                  </span>
                  <motion.span
                    className="text-[10px] font-mono"
                    animate={{
                      color: showGlow ? "#d4b08c" : "rgba(255,255,255,0.4)"
                    }}
                    transition={{ duration: 0.25 }}
                  >
                    {step.value}
                  </motion.span>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
