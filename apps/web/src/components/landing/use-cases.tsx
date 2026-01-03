"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { USE_CASES } from "@/lib/constants";

const colorMap = {
  orange: {
    bg: "from-orange-500/20 to-amber-500/20",
    accent: "#f97316",
    border: "border-orange-500/20",
  },
  green: {
    bg: "from-green-500/20 to-emerald-500/20",
    accent: "#22c55e",
    border: "border-green-500/20",
  },
  pink: {
    bg: "from-pink-500/20 to-rose-500/20",
    accent: "#ec4899",
    border: "border-pink-500/20",
  },
  blue: {
    bg: "from-blue-500/20 to-cyan-500/20",
    accent: "#3b82f6",
    border: "border-blue-500/20",
  },
};

export function UseCases() {
  return (
    <section className="py-24 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Powering data teams
            <br />
            worldwide
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            See how leading companies use ScrapePilot to automate their data
            collection workflows
          </p>
        </motion.div>

        {/* Use Cases */}
        <div className="space-y-24">
          {USE_CASES.map((useCase, i) => {
            const colors = colorMap[useCase.color as keyof typeof colorMap];
            const isReversed = i % 2 === 1;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  isReversed ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div className={isReversed ? "lg:order-2" : ""}>
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-1 h-6 rounded-full"
                      style={{ background: colors.accent }}
                    />
                    <span className="text-sm font-medium text-[var(--muted-foreground)]">
                      {useCase.category}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                    {useCase.title}
                  </h3>
                  <p className="text-[var(--muted-foreground)] mb-6">
                    {useCase.description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {useCase.stats.map((stat, j) => (
                      <Badge key={j} variant="outline">
                        {stat}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Illustration Card */}
                <div className={isReversed ? "lg:order-1" : ""}>
                  <Card
                    className={`relative overflow-hidden p-8 bg-gradient-to-br ${colors.bg}`}
                  >
                    {/* Decorative dots */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-2">
                      {[...Array(6)].map((_, j) => (
                        <div
                          key={j}
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: colors.accent,
                            opacity: 0.3 + j * 0.1,
                          }}
                        />
                      ))}
                    </div>

                    {/* Main illustration placeholder */}
                    <div className="ml-8 relative">
                      <div
                        className="w-full aspect-[4/3] rounded-xl border-2 border-dashed flex items-center justify-center"
                        style={{ borderColor: `${colors.accent}40` }}
                      >
                        <div
                          className="text-6xl opacity-30"
                          style={{ color: colors.accent }}
                        >
                          {useCase.category === "E-COMMERCE" && "💰"}
                          {useCase.category === "SEO" && "🔍"}
                          {useCase.category === "FINANCE" && "📊"}
                          {useCase.category === "MEDIA" && "📰"}
                          {useCase.category === "SALES" && "🎯"}
                        </div>
                      </div>

                      {/* Stats overlay */}
                      <div
                        className="absolute -bottom-4 -right-4 px-4 py-3 rounded-lg border"
                        style={{
                          background: "var(--card)",
                          borderColor: "var(--border)",
                        }}
                      >
                        <div
                          className="text-2xl font-bold"
                          style={{ color: colors.accent }}
                        >
                          {useCase.stats[0]?.split(" ")[0]}
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)] uppercase">
                          {useCase.stats[0]?.split(" ").slice(1).join(" ")}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
