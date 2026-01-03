"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MacWindow } from "@/components/ui/code-block";
import { FEATURE_TAGS, COMPARISON_DATA } from "@/lib/constants";
import { Check, X, Zap } from "lucide-react";

export function FeaturesSection() {
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
            Production-grade features
            <br />
            <span className="text-gradient">that scale</span>
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Enterprise reliability meets developer experience. Built for teams
            that ship fast.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid lg:grid-cols-2 gap-12 mb-24">
          {/* Fast Response Times */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4">
              Lightning Fast
            </Badge>
            <h3 className="text-2xl font-bold mb-4">Fast response times</h3>
            <p className="text-[var(--muted-foreground)] mb-6">
              Built on cutting-edge infrastructure with global CDN, intelligent
              caching, and optimized rendering engines. Average response time
              under 2 seconds.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-2xl font-bold">&lt;2s</div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  RESPONSE TIME
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  UPTIME
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  GLOBAL CDN
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <MacWindow>
              <div className="bg-[var(--background)] rounded-lg p-4">
                <div className="text-sm font-medium mb-4">Advanced Usage Analytics</div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-xl font-bold">51,902</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      Total Requests
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[var(--success)]">67.7%</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      Success Rate
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">277ms</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      Avg Latency
                    </div>
                  </div>
                </div>
                {/* Placeholder chart */}
                <div className="h-32 bg-gradient-to-r from-[var(--primary)]/20 via-[var(--accent-blue)]/20 to-[var(--accent-green)]/20 rounded-lg flex items-end justify-between px-4 py-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75].map((h, i) => (
                    <div
                      key={i}
                      className="w-4 bg-[var(--primary)] rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </MacWindow>
          </motion.div>
        </div>

        {/* Browser Automation */}
        <div className="grid lg:grid-cols-2 gap-12 mb-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <MacWindow>
              <div className="bg-[var(--background)] rounded-lg p-4 text-center">
                <div className="text-sm text-[var(--muted-foreground)] mb-2">
                  API Playground
                </div>
                <div className="bg-white rounded-lg p-8">
                  <div className="text-black font-bold text-lg">Example Domain</div>
                  <div className="text-gray-600 text-sm mt-2">
                    This is for documentation examples.
                  </div>
                </div>
              </div>
            </MacWindow>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <Badge variant="secondary" className="mb-4">
              JavaScript Rendering
            </Badge>
            <h3 className="text-2xl font-bold mb-4">Full browser automation</h3>
            <p className="text-[var(--muted-foreground)] mb-6">
              Execute JavaScript, wait for dynamic content, take screenshots,
              and handle complex SPAs. Powered by Playwright for maximum
              compatibility.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  JS SUPPORT
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-lg font-bold">Chrome, Firefox</div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  BROWSERS
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold">Headless</div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  RENDERING
                </div>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Feature Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-24"
        >
          <Card className="inline-block p-8">
            <h3 className="text-2xl font-bold mb-2">Plus 20+ more features</h3>
            <p className="text-[var(--muted-foreground)] mb-6">
              Everything you need for production web scraping at scale
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {FEATURE_TAGS.map((tag, i) => (
                <Badge key={i} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-3 w-3 mr-1" />
            Why ScrapePilot
          </Badge>
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            Stop wrestling with infrastructure
          </h3>
          <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
            Focus on building your product, not maintaining scraping
            infrastructure. See how ScrapePilot compares to traditional
            approaches.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-4 font-medium">Feature</th>
                  <th className="text-center p-4 font-medium text-[var(--muted-foreground)]">
                    Traditional
                    <div className="text-xs font-normal flex items-center justify-center gap-1 mt-1">
                      <X className="h-3 w-3 text-[var(--error)]" />
                      Complex
                    </div>
                  </th>
                  <th className="text-center p-4 font-medium">
                    ScrapePilot
                    <div className="text-xs font-normal flex items-center justify-center gap-1 mt-1">
                      <Check className="h-3 w-3 text-[var(--success)]" />
                      Simple
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="p-4 font-medium flex items-center gap-2">
                      {row.highlight && (
                        <Zap className="h-4 w-4 text-[var(--warning)]" />
                      )}
                      {row.feature}
                    </td>
                    <td className="p-4 text-center text-[var(--muted-foreground)]">
                      {row.traditional}
                    </td>
                    <td className="p-4 text-center font-medium">
                      {row.scrapepilot}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
