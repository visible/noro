"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Spinner } from "./spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "icon";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: "bg-[#d4b08c] text-black hover:bg-[#c9a57e] active:bg-[#be9a70]",
  secondary: "bg-white/10 text-white border border-white/20 hover:bg-white/15 active:bg-white/20",
  ghost: "text-white/70 hover:bg-white/10 active:bg-white/15",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  icon: "text-white/70 hover:bg-white/10 active:bg-white/15",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

const iconsizes: Record<Size, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading = false, disabled, className = "", children, ...props }, ref) => {
    const isicon = variant === "icon";
    const base = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#d4b08c]/50 disabled:opacity-50 disabled:pointer-events-none";
    const variantclass = variants[variant];
    const sizeclass = isicon ? iconsizes[size] : sizes[size];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variantclass} ${sizeclass} ${className}`}
        {...props}
      >
        {loading ? (
          <>
            <Spinner className="w-4 h-4 mr-2" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
