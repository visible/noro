"use client";

import { useState, useCallback, useEffect } from "react";

interface Props {
  onSelect?: (password: string) => void;
  compact?: boolean;
}

const chars = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export function Generator({ onSelect, compact }: Props) {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(24);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let pool = "";
    if (uppercase) pool += chars.uppercase;
    if (lowercase) pool += chars.lowercase;
    if (numbers) pool += chars.numbers;
    if (symbols) pool += chars.symbols;

    if (!pool) pool = chars.lowercase;

    const bytes = crypto.getRandomValues(new Uint8Array(length));
    let result = "";
    for (let i = 0; i < length; i++) {
      result += pool[bytes[i] % pool.length];
    }

    setPassword(result);
    setCopied(false);
  }, [length, uppercase, lowercase, numbers, symbols]);

  useEffect(() => {
    generate();
  }, [generate]);

  async function copy() {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function select() {
    if (onSelect) onSelect(password);
  }

  return (
    <div className={compact ? "" : "max-w-xl"}>
      <div className="bg-white/5 rounded-lg p-4 mb-6">
        <p className="font-mono text-lg break-all mb-3 min-h-[28px]">
          {password}
        </p>
        <div className="flex gap-2">
          <button
            onClick={copy}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
          >
            {copied ? "copied" : "copy"}
          </button>
          <button
            onClick={generate}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
          >
            regenerate
          </button>
          {onSelect && (
            <button
              onClick={select}
              className="px-4 py-2 bg-[#FF6B00] text-black rounded-lg hover:bg-[#FF6B00]/90 transition-colors text-sm font-medium"
            >
              use
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-white/60 mb-3">
            length: {length}
          </label>
          <input
            type="range"
            min={8}
            max={128}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-[#FF6B00]"
          />
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-3">
            characters
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "ABC", value: uppercase, set: setUppercase },
              { label: "abc", value: lowercase, set: setLowercase },
              { label: "123", value: numbers, set: setNumbers },
              { label: "!@#", value: symbols, set: setSymbols },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => opt.set(!opt.value)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  opt.value
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-white/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
