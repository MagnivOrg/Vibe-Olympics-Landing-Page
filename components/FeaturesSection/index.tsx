"use client";

import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";

interface Feature {
  id: number;
  title: string;
  description: string;
  items: string[];
}

interface FeaturesSectionProps {
  features: Feature[];
}

export const FeaturesSection = ({ features }: FeaturesSectionProps) => {
  return (
    <section id="features" className="relative py-20 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-title font-bold text-foreground mb-6">
            Everything you need to succeed
          </h2>
          <p className="text-body-lg text-muted max-w-2xl mx-auto">
            From ideation to deployment, we provide all the tools and support you need.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Card className="h-full">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-start gap-3 text-sm text-muted"
                    >
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
