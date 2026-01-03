"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Code2, Zap, Shield, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeBlock, MacWindow } from "@/components/ui/code-block";
import { CODE_EXAMPLES, SAMPLE_RESPONSE, FEATURES } from "@/lib/constants";

const iconMap = {
  Zap,
  Shield,
  Sparkles,
};

export function DeveloperExperience() {
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
          <Badge variant="secondary" className="mb-4">
            <Code2 className="h-3 w-3 mr-1" />
            Developer Experience
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Simple API, Powerful Results
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Get started in minutes with our intuitive API. One request gives you
            structured data, screenshots, PDFs, and more. No browser management,
            no infrastructure headaches.
          </p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-6 mb-16"
        >
          {FEATURES.map((feature, i) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                  <Icon className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div>
                  <div className="font-medium text-sm">{feature.title}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {feature.description}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Code Examples */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Request */}
          <div>
            <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-3">
              Request
            </h3>
            <Tabs defaultValue="curl">
              <TabsList className="mb-4">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="nodejs">Node.js</TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <CodeBlock code={CODE_EXAMPLES.curl} language="bash" />
              </TabsContent>
              <TabsContent value="python">
                <CodeBlock code={CODE_EXAMPLES.python} language="python" />
              </TabsContent>
              <TabsContent value="nodejs">
                <CodeBlock code={CODE_EXAMPLES.nodejs} language="javascript" />
              </TabsContent>
            </Tabs>
          </div>

          {/* Response */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[var(--muted-foreground)]">
                Response
              </h3>
              <Badge variant="success" className="text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] mr-1.5" />
                200 OK
              </Badge>
            </div>
            <CodeBlock code={SAMPLE_RESPONSE} language="json" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
