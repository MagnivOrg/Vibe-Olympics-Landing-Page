"use client";

import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "accent";
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm text-sm";

    const variants = {
      default: "bg-white/5 border border-white/10 text-muted",
      accent: "bg-accent/10 border border-accent/30 text-accent",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";
