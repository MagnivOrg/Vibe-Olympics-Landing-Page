"use client";

import { motion } from "framer-motion";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12"
        >
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Vibe Olympics
            </h3>
            <p className="text-muted max-w-md leading-relaxed">
              Experience the future of competition. Build, ship, and compete with the best developers around the world.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Event</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted hover:text-foreground transition-colors duration-300"
                >
                  Schedule
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted hover:text-foreground transition-colors duration-300"
                >
                  Venue
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted hover:text-foreground transition-colors duration-300"
                >
                  Prizes
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Connect</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted hover:text-foreground transition-colors duration-300"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted hover:text-foreground transition-colors duration-300"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted hover:text-foreground transition-colors duration-300"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="pt-8 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted">
              © {currentYear} Vibe Olympics. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm text-muted hover:text-foreground transition-colors duration-300"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-muted hover:text-foreground transition-colors duration-300"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
