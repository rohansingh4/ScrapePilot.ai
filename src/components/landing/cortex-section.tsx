"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CORTEX_FEATURES, OPTIMIZATION_STEPS } from "@/lib/constants";

// Lazy load the 3D crystal animation
const CrystalAnimation = dynamic(
  () => import("@/components/3d/crystal-animation").then((mod) => mod.CrystalAnimation),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div
          className="w-48 h-48 rounded-full animate-pulse"
          style={{
            background:
              "radial-gradient(circle, #ec4899 0%, #8b5cf6 50%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>
    ),
  }
);

export function CortexSection() {
  return (
    <section className="py-24 bg-[var(--background)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] mr-2 animate-pulse" />
            Powered by AI
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            ScrapePilot Cortex
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            An autonomous AI system that monitors your scraping infrastructure,
            diagnoses failures in real-time, and deploys optimizations
            automatically.
          </p>
        </motion.div>

        {/* Crystal Animation and Features */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          {/* Crystal Animation */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <CrystalAnimation />

            {/* Floating labels */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute top-20 right-10 bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs"
            >
              <div className="text-[var(--muted-foreground)]">TLS Fingerprint</div>
              <div className="font-medium">Rotating</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="absolute bottom-20 left-10 bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs"
            >
              <div className="text-[var(--muted-foreground)]">Strategy</div>
              <div className="font-medium">Optimized</div>
            </motion.div>
          </motion.div>

          {/* Features List */}
          <div className="space-y-6">
            {CORTEX_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pl-8 border-l-2 border-[var(--border)] hover:border-[var(--primary)] transition-colors"
              >
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-[var(--muted)] group-hover:bg-[var(--primary)]" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-[var(--muted-foreground)] text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Zero-Touch Optimization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            Zero-Touch Optimization
          </h3>
          <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
            Cortex operates autonomously, continuously improving your scraping
            success rates without requiring manual intervention.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {OPTIMIZATION_STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--card-border-hover)] transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border)] text-sm font-medium">
                  {step.number}
                </span>
                {i < OPTIMIZATION_STEPS.length - 1 && (
                  <span className="text-[var(--muted)] hidden lg:block">▶</span>
                )}
              </div>
              <h4 className="font-semibold mb-2">{step.title}</h4>
              <p className="text-sm text-[var(--muted-foreground)]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
