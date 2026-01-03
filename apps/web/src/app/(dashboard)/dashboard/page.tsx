"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiClient, type ScrapeResult, type ScrapeParams } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScrapeHistoryItem {
  id: string;
  url: string;
  result: ScrapeResult;
  timestamp: Date;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const [url, setUrl] = React.useState("");
  const [renderMode, setRenderMode] = React.useState<"http" | "browser">("http");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [currentResult, setCurrentResult] = React.useState<ScrapeResult | null>(null);
  const [history, setHistory] = React.useState<ScrapeHistoryItem[]>([]);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    setCurrentResult(null);

    try {
      const params: ScrapeParams = {
        url,
        renderMode,
        waitFor: renderMode === "browser" ? "networkidle" : "load",
        timeout: 30000,
      };

      const response = await apiClient.scrape(params);
      if (response.success && response.data) {
        setCurrentResult(response.data);
        // Add to history
        setHistory(prev => [{
          id: Date.now().toString(),
          url,
          result: response.data!,
          timestamp: new Date(),
        }, ...prev].slice(0, 10));
        // Refresh user to update credits
        refreshUser();
      } else {
        setError(response.error?.message || "Failed to scrape URL");
      }
    } catch {
      setError("An error occurred while scraping");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">ScrapePilot</h1>
              <Badge variant="outline" className="text-pink-500 border-pink-500">
                {user.plan.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-[var(--muted-foreground)]">
                <span className="font-medium text-[var(--foreground)]">{user.credits.toLocaleString()}</span> credits
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{user.name}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scrape Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Scrape a URL</h2>
              <form onSubmit={handleScrape} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="url">URL to Scrape</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Render Mode</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="renderMode"
                        value="http"
                        checked={renderMode === "http"}
                        onChange={() => setRenderMode("http")}
                        className="text-pink-500"
                      />
                      <span className="text-sm">HTTP (Fast)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="renderMode"
                        value="browser"
                        checked={renderMode === "browser"}
                        onChange={() => setRenderMode("browser")}
                        className="text-pink-500"
                      />
                      <span className="text-sm">Browser (JavaScript)</span>
                    </label>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Use Browser mode for JavaScript-heavy sites (uses more credits)
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Scraping...
                    </span>
                  ) : (
                    "Scrape URL"
                  )}
                </Button>
              </form>

              {/* Current Result */}
              {currentResult && (
                <div className="mt-6 border-t border-[var(--border)] pt-6">
                  <h3 className="text-md font-semibold mb-4">Result</h3>
                  <ResultCard result={currentResult} />
                </div>
              )}
            </Card>
          </div>

          {/* Scrape History */}
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Scrapes</h2>
              {history.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">No scrapes yet. Try scraping a URL!</p>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <HistoryCard
                      key={item.id}
                      item={item}
                      onClick={() => setCurrentResult(item.result)}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function ResultCard({ result }: { result: ScrapeResult }) {
  const [showHtml, setShowHtml] = React.useState(false);

  return (
    <div className="space-y-4">
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="p-2 rounded bg-[var(--muted)]/10">
          <p className="text-[var(--muted-foreground)]">Status</p>
          <p className="font-medium">{result.statusCode}</p>
        </div>
        <div className="p-2 rounded bg-[var(--muted)]/10">
          <p className="text-[var(--muted-foreground)]">Load Time</p>
          <p className="font-medium">{result.metrics.loadTime}ms</p>
        </div>
        <div className="p-2 rounded bg-[var(--muted)]/10">
          <p className="text-[var(--muted-foreground)]">Size</p>
          <p className="font-medium">{formatBytes(result.metrics.size)}</p>
        </div>
        <div className="p-2 rounded bg-[var(--muted)]/10">
          <p className="text-[var(--muted-foreground)]">Credits</p>
          <p className="font-medium">{result.metrics.creditsUsed}</p>
        </div>
      </div>

      {/* Metadata */}
      <div className="p-3 rounded bg-[var(--muted)]/10">
        <p className="text-xs text-[var(--muted-foreground)] mb-1">Page Title</p>
        <p className="text-sm font-medium">{result.metadata.title || "No title"}</p>
        {result.metadata.description && (
          <>
            <p className="text-xs text-[var(--muted-foreground)] mt-2 mb-1">Description</p>
            <p className="text-sm">{result.metadata.description}</p>
          </>
        )}
      </div>

      {/* Extracted Text */}
      {result.text && (
        <div>
          <p className="text-xs text-[var(--muted-foreground)] mb-1">Extracted Text</p>
          <div className="p-3 rounded bg-[var(--muted)]/10 text-xs max-h-48 overflow-auto">
            <pre className="whitespace-pre-wrap">{result.text}</pre>
          </div>
        </div>
      )}

      {/* Links */}
      {result.metadata.links.length > 0 && (
        <div>
          <p className="text-xs text-[var(--muted-foreground)] mb-1">
            Links Found ({result.metadata.links.length})
          </p>
          <div className="p-3 rounded bg-[var(--muted)]/10 text-xs max-h-32 overflow-auto">
            {result.metadata.links.slice(0, 10).map((link, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-pink-500 hover:underline truncate"
              >
                {link}
              </a>
            ))}
            {result.metadata.links.length > 10 && (
              <p className="text-[var(--muted-foreground)] mt-1">
                +{result.metadata.links.length - 10} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* HTML Toggle */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHtml(!showHtml)}
        >
          {showHtml ? "Hide HTML" : "Show HTML"}
        </Button>
        {showHtml && (
          <div className="mt-2 p-3 rounded bg-[var(--muted)]/10 text-xs max-h-64 overflow-auto">
            <pre className="whitespace-pre-wrap">{result.html}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ item, onClick }: { item: ScrapeHistoryItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]/20 transition-colors text-left"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          {item.result.statusCode}
        </Badge>
        <span className="text-xs text-[var(--muted-foreground)]">
          {item.timestamp.toLocaleTimeString()}
        </span>
      </div>
      <p className="text-sm truncate" title={item.url}>
        {item.url}
      </p>
      <p className="text-xs text-[var(--muted-foreground)] mt-1">
        {item.result.metadata.title || "No title"}
      </p>
    </button>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
