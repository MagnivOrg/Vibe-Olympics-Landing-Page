"use client";

import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "highlight";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const baseStyles =
      "rounded-2xl p-8 transition-all duration-500 ease-out";

    const variants = {
      default:
        "bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-xl",
      highlight:
        "bg-gradient-to-br from-accent/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-accent/30 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/20",
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

Card.displayName = "Card";
