"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <a
              href="#"
              className="text-2xl font-bold text-foreground hover:text-accent transition-colors duration-300"
            >
              Vibe Olympics
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-sm text-muted hover:text-foreground transition-colors duration-300"
            >
              Features
            </a>
            <a
              href="#showcase"
              className="text-sm text-muted hover:text-foreground transition-colors duration-300"
            >
              Showcase
            </a>
            <a
              href="#about"
              className="text-sm text-muted hover:text-foreground transition-colors duration-300"
            >
              About
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="primary" size="sm">
              Apply Now
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
