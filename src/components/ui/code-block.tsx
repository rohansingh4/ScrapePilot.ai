"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = "javascript",
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split("\n");

  return (
    <div className={cn("relative group", className)}>
      <button
        onClick={copyToClipboard}
        className="absolute right-3 top-3 p-2 rounded-md bg-[var(--secondary)] text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--foreground)]"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      <pre className="overflow-x-auto rounded-lg bg-[var(--card)] border border-[var(--border)] p-4 text-sm font-mono">
        <code className={`language-${language}`}>
          {showLineNumbers ? (
            lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="select-none w-8 text-[var(--muted)] text-right mr-4">
                  {i + 1}
                </span>
                <span className="text-[var(--muted-foreground)]">{line}</span>
              </div>
            ))
          ) : (
            <span className="text-[var(--muted-foreground)]">{code}</span>
          )}
        </code>
      </pre>
    </div>
  );
}

interface MacWindowProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function MacWindow({ title, children, className }: MacWindowProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="mac-dots">
          <span />
          <span />
          <span />
        </div>
        {title && (
          <span className="text-xs text-[var(--muted-foreground)] font-mono">
            {title}
          </span>
        )}
        <div className="w-14" />
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
