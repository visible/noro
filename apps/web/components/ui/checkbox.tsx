"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = "", disabled, id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className={`
            flex items-center gap-3 cursor-pointer
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div className="relative shrink-0">
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              disabled={disabled}
              className="peer sr-only"
              {...props}
            />
            <div
              className={`
                w-5 h-5 rounded border bg-white/5
                transition-all duration-150
                peer-checked:bg-[#d4b08c] peer-checked:border-[#d4b08c]
                peer-focus-visible:ring-2 peer-focus-visible:ring-[#d4b08c]/20
                ${error ? "border-red-500" : "border-white/20"}
                ${className}
              `}
            />
            <svg
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {label && <span className="text-sm text-white/80">{label}</span>}
        </label>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
