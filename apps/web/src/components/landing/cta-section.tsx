"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const benefits = [
  "No credit card required",
  "$1 free credit",
  "Pay only for what you use",
  "$5 minimum deposit",
];

export function CTASection() {
  return (
    <section className="py-24 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="relative overflow-hidden p-12 text-center">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 via-transparent to-[var(--accent-pink)]/5 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-lg text-[var(--muted-foreground)] max-w-xl mx-auto mb-8">
                Join developers worldwide building with ScrapePilot. Start with $1
                free credit — no credit card required.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/sign-up">
                    Get started free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Link href="/pricing">View pricing</Link>
                </Button>
              </div>

              {/* Benefits */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--muted-foreground)]">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[var(--success)]" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm text-[var(--muted)]">
                Start scraping in under 60 seconds
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
