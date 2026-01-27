"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white/80 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={`
              w-full px-3 py-2.5 rounded-lg border bg-white/5
              outline-none text-sm text-white appearance-none
              transition-all duration-150 cursor-pointer pr-10
              ${error ? "border-red-500 focus:ring-2 focus:ring-red-500/30" : "border-white/10 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20"}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-stone-900">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-stone-900">
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
