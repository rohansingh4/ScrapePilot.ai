"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Zap } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PRICING_PLANS } from "@/lib/constants";

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              Transparent Pricing
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Simple, predictable pricing
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees, no surprise charges.
              Pay only for what you use.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {PRICING_PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card
                  className={cn(
                    "relative h-full flex flex-col p-6",
                    plan.highlighted && "border-[var(--primary)] glow"
                  )}
                >
                  {plan.highlighted && (
                    <Badge
                      variant="primary"
                      className="absolute -top-3 left-1/2 -translate-x-1/2"
                    >
                      Most Popular
                    </Badge>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-[var(--muted-foreground)]">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] mt-2">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="text-sm font-medium mb-2">
                      {plan.credits} credits{plan.credits !== "Unlimited" && "/mo"}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]"
                      >
                        <Check className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    variant={plan.highlighted ? "primary" : "secondary"}
                    className="w-full"
                  >
                    <Link href="/register">
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Credit Costs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-24"
          >
            <h2 className="text-2xl font-bold text-center mb-8">
              Credit Usage
            </h2>
            <Card className="max-w-2xl mx-auto overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left p-4 font-medium">Operation</th>
                    <th className="text-right p-4 font-medium">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { op: "Basic HTML scrape", credits: 1 },
                    { op: "JavaScript rendering", credits: 2 },
                    { op: "Screenshot capture", credits: 1 },
                    { op: "PDF generation", credits: 2 },
                    { op: "OCR extraction", credits: 3 },
                    { op: "CAPTCHA solving", credits: 5 },
                    { op: "Proxy rotation", credits: 1 },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="p-4">{row.op}</td>
                      <td className="p-4 text-right font-mono">
                        {row.credits}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  q: "How do credits work?",
                  a: "Credits are consumed when you make API requests. Different operations cost different amounts of credits. Unused credits roll over to the next month on paid plans.",
                },
                {
                  q: "Can I upgrade or downgrade anytime?",
                  a: "Yes, you can change your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change takes effect at the next billing cycle.",
                },
                {
                  q: "What happens if I run out of credits?",
                  a: "You can purchase additional credits at any time, or upgrade to a higher plan. We'll send you alerts when you're running low on credits.",
                },
                {
                  q: "Is there a free trial?",
                  a: "Yes! Every new account starts with $1 free credit (about 1,000 basic scrapes). No credit card required to get started.",
                },
                {
                  q: "Do you offer volume discounts?",
                  a: "Yes, enterprise plans include volume discounts. Contact our sales team for custom pricing based on your usage needs.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards (Visa, Mastercard, American Express) and support invoicing for enterprise customers.",
                },
              ].map((faq, i) => (
                <Card key={i} className="p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {faq.a}
                  </p>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Enterprise CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-24 text-center"
          >
            <Card className="max-w-2xl mx-auto p-8">
              <Zap className="h-10 w-10 text-[var(--primary)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Need more?</h2>
              <p className="text-[var(--muted-foreground)] mb-6">
                For high-volume usage, custom integrations, or dedicated support,
                our enterprise plan has you covered.
              </p>
              <Button asChild size="lg">
                <Link href="/contact">
                  Contact Sales
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
