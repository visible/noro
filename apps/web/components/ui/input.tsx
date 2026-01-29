"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, suffix, className = "", disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white/80 mb-1.5">
            {label}
          </label>
        )}
        <div
          className={`
            flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-white/5
            transition-all duration-150
            ${error ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500/30" : "border-white/10 focus-within:border-[#d4b08c] focus-within:ring-2 focus-within:ring-[#d4b08c]/20"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {prefix && <span className="text-white/40 shrink-0">{prefix}</span>}
          <input
            ref={ref}
            disabled={disabled}
            className={`
              flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/30
              disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          {suffix && <span className="text-white/40 shrink-0">{suffix}</span>}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
