"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Globe, Search, FileText, Code2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MacWindow } from "@/components/ui/code-block";
import { STATS } from "@/lib/constants";

const tabs = [
  { id: "scrape", label: "Scrape", icon: Globe },
  { id: "search", label: "Search", icon: Search },
  { id: "map", label: "Map", icon: FileText },
  { id: "crawl", label: "Crawl", icon: Code2 },
];

export function APIPlayground() {
  const [activeTab, setActiveTab] = React.useState("scrape");
  const [url, setUrl] = React.useState("https://example.com");

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <MacWindow title="api.scrapepilot.ai" className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-[var(--secondary)] text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Input and Button */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  icon={<Globe className="h-4 w-4" />}
                  placeholder="https://example.com"
                  className="bg-[var(--background)]"
                />
              </div>
              <Button className="shrink-0">
                Scrape
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </MacWindow>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-16"
        >
          {STATS.map((stat, i) => (
            <React.Fragment key={i}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--muted-foreground)] mt-1">
                  {stat.label}
                </div>
              </div>
              {i < STATS.length - 1 && (
                <div className="hidden md:block w-px h-12 bg-[var(--border)]" />
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
