"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white/80 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          disabled={disabled}
          className={`
            w-full px-3 py-2.5 rounded-lg border bg-white/5
            outline-none text-sm text-white placeholder:text-white/30
            transition-all duration-150 resize-none
            ${error ? "border-red-500 focus:ring-2 focus:ring-red-500/30" : "border-white/10 focus:border-[#d4b08c] focus:ring-2 focus:ring-[#d4b08c]/20"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
