"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "primary", size = "md", children, ...props },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 ease-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

    const variants = {
      primary:
        "text-background bg-foreground hover:scale-105 hover:shadow-2xl hover:shadow-white/20",
      secondary:
        "text-foreground bg-transparent border-2 border-foreground/20 hover:border-foreground hover:bg-foreground/5 hover:scale-105",
      accent:
        "text-white bg-accent hover:bg-accentHover hover:scale-105 hover:shadow-2xl hover:shadow-accent/30",
    };

    const sizes = {
      sm: "px-5 py-2 text-sm",
      md: "px-8 py-4 text-base",
      lg: "px-10 py-5 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
