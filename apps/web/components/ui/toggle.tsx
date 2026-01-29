"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, className = "", disabled, id, ...props }, ref) => {
    const inputId = id || `toggle-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <label
        htmlFor={inputId}
        className={`
          inline-flex items-center gap-3 cursor-pointer
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <div className="relative shrink-0">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            role="switch"
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`
              w-11 h-6 rounded-full bg-white/20
              transition-colors duration-150
              peer-checked:bg-[#d4b08c]
              peer-focus-visible:ring-2 peer-focus-visible:ring-[#d4b08c]/20
              ${className}
            `}
          />
          <div
            className={`
              absolute top-1 left-1 w-4 h-4 rounded-full bg-white
              transition-transform duration-150
              peer-checked:translate-x-5
            `}
          />
        </div>
        {label && <span className="text-sm text-white/80">{label}</span>}
      </label>
    );
  }
);

Toggle.displayName = "Toggle";
