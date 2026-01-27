"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "icon";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: "bg-[#FF6B00] text-black hover:bg-[#E65F00] active:bg-[#CC5500]",
  secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 active:bg-gray-100",
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

function Spinner({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading = false, disabled, className = "", children, ...props }, ref) => {
    const isicon = variant === "icon";
    const base = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50 disabled:opacity-50 disabled:pointer-events-none";
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
