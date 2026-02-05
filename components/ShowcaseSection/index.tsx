"use client";

import { motion } from "framer-motion";

interface ShowcaseData {
  title: string;
  companies: string[];
}

interface ShowcaseSectionProps {
  data: ShowcaseData;
}

export const ShowcaseSection = ({ data }: ShowcaseSectionProps) => {
  return (
    <section id="showcase" className="relative py-20 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-title font-bold text-foreground mb-6">
            {data.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {data.companies.map((company, index) => (
            <motion.div
              key={company}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-full h-20 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <span className="text-lg font-semibold text-muted hover:text-foreground transition-colors duration-300">
                    {company}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
