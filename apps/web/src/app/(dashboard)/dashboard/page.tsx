"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiClient, type ScrapeResult, type ScrapeParams, type ExtractSuggestion, type AIExtraction } from "@/lib/api/client";
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
  const [extractPrompt, setExtractPrompt] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [currentResult, setCurrentResult] = React.useState<ScrapeResult | null>(null);
  const [suggestions, setSuggestions] = React.useState<ExtractSuggestion[]>([]);
  const [history, setHistory] = React.useState<ScrapeHistoryItem[]>([]);
  const [activeTab, setActiveTab] = React.useState<"result" | "ai" | "export">("result");

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
    setSuggestions([]);

    try {
      const params: ScrapeParams = {
        url,
        renderMode,
        waitFor: renderMode === "browser" ? "domcontentloaded" : "load",
        timeout: 30000,
        extractPrompt: extractPrompt || undefined,
      };

      const response = await apiClient.scrape(params);
      if (response.success && response.data) {
        setCurrentResult(response.data);
        setHistory(prev => [{
          id: Date.now().toString(),
          url,
          result: response.data!,
          timestamp: new Date(),
        }, ...prev].slice(0, 10));
        refreshUser();

        // Switch to AI tab if extraction was performed
        if (extractPrompt && response.data.aiExtraction) {
          setActiveTab("ai");
        }
      } else {
        setError(response.error?.message || "Failed to scrape URL");
      }
    } catch {
      setError("An error occurred while scraping");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetect = async () => {
    if (!url) return;
    setIsDetecting(true);
    setError("");
    setSuggestions([]);

    try {
      const response = await apiClient.detect(url, renderMode);
      if (response.success && response.data) {
        setSuggestions(response.data.suggestions);
        refreshUser();
      } else {
        setError(response.error?.message || "Failed to detect extractable data");
      }
    } catch {
      setError("An error occurred during detection");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleExport = async (format: "json" | "csv" | "markdown") => {
    if (!currentResult) return;

    try {
      const params: ScrapeParams = {
        url: currentResult.url,
        renderMode,
        extractPrompt: extractPrompt || undefined,
      };

      const blob = await apiClient.exportData(params, format);
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${new URL(currentResult.url).hostname}-data.${format === "markdown" ? "md" : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
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
                  <div className="flex gap-2">
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDetect}
                      disabled={!url || isDetecting}
                      title="Auto-detect extractable data with AI"
                    >
                      {isDetecting ? "..." : "AI Detect"}
                    </Button>
                  </div>
                </div>

                {/* AI Suggestions */}
                {suggestions.length > 0 && (
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <p className="text-xs text-purple-400 mb-2 font-medium">AI Detected Data:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setExtractPrompt(s.prompt)}
                          className="text-xs px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-colors"
                          title={s.description}
                        >
                          {s.name} ({Math.round(s.confidence * 100)}%)
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                </div>

                {/* AI Extraction Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="extractPrompt">
                    AI Extraction (Optional)
                    <span className="text-xs text-[var(--muted-foreground)] ml-2">Powered by Groq</span>
                  </Label>
                  <Input
                    id="extractPrompt"
                    type="text"
                    placeholder="e.g., Extract all product names and prices"
                    value={extractPrompt}
                    onChange={(e) => setExtractPrompt(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Describe what data you want to extract in plain English
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
                      {extractPrompt ? "Scraping & Extracting..." : "Scraping..."}
                    </span>
                  ) : (
                    extractPrompt ? "Scrape & Extract with AI" : "Scrape URL"
                  )}
                </Button>
              </form>

              {/* Results Section */}
              {currentResult && (
                <div className="mt-6 border-t border-[var(--border)] pt-6">
                  {/* Tab Navigation */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setActiveTab("result")}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        activeTab === "result"
                          ? "bg-pink-500/20 text-pink-400"
                          : "hover:bg-[var(--muted)]/20"
                      }`}
                    >
                      Result
                    </button>
                    {currentResult.aiExtraction && (
                      <button
                        onClick={() => setActiveTab("ai")}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                          activeTab === "ai"
                            ? "bg-purple-500/20 text-purple-400"
                            : "hover:bg-[var(--muted)]/20"
                        }`}
                      >
                        AI Data
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab("export")}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        activeTab === "export"
                          ? "bg-green-500/20 text-green-400"
                          : "hover:bg-[var(--muted)]/20"
                      }`}
                    >
                      Export
                    </button>
                  </div>

                  {activeTab === "result" && <ResultCard result={currentResult} />}
                  {activeTab === "ai" && currentResult.aiExtraction && (
                    <AIExtractionCard extraction={currentResult.aiExtraction} />
                  )}
                  {activeTab === "export" && (
                    <ExportCard
                      result={currentResult}
                      onExport={handleExport}
                      hasAIData={!!currentResult.aiExtraction}
                    />
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Examples</h2>
              <div className="space-y-2">
                {[
                  { prompt: "Extract all links and their text", label: "All Links" },
                  { prompt: "Get the main heading and summary", label: "Page Summary" },
                  { prompt: "Extract all images with alt text", label: "Images" },
                  { prompt: "Find all email addresses", label: "Emails" },
                  { prompt: "Extract prices and product names", label: "Products" },
                ].map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setExtractPrompt(example.prompt)}
                    className="w-full text-left text-xs px-3 py-2 rounded-md bg-[var(--muted)]/10 hover:bg-[var(--muted)]/20 transition-colors"
                  >
                    {example.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Scrape History */}
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
                      onClick={() => {
                        setCurrentResult(item.result);
                        setActiveTab("result");
                      }}
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
            <pre className="whitespace-pre-wrap">{result.text.slice(0, 2000)}{result.text.length > 2000 && "..."}</pre>
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
            <pre className="whitespace-pre-wrap">{result.html.slice(0, 5000)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

function AIExtractionCard({ extraction }: { extraction: AIExtraction }) {
  const [viewMode, setViewMode] = React.useState<"table" | "json">("table");
  const data = extraction.data;

  return (
    <div className="space-y-4">
      {/* Confidence Badge */}
      <div className="flex items-center gap-2">
        <Badge className={`${
          extraction.confidence > 0.8 ? "bg-green-500/20 text-green-400" :
          extraction.confidence > 0.5 ? "bg-yellow-500/20 text-yellow-400" :
          "bg-red-500/20 text-red-400"
        }`}>
          {Math.round(extraction.confidence * 100)}% confidence
        </Badge>
        <span className="text-xs text-[var(--muted-foreground)]">
          Format: {extraction.format}
        </span>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode("table")}
          className={`px-2 py-1 text-xs rounded ${viewMode === "table" ? "bg-purple-500/20" : "bg-[var(--muted)]/10"}`}
        >
          Table
        </button>
        <button
          onClick={() => setViewMode("json")}
          className={`px-2 py-1 text-xs rounded ${viewMode === "json" ? "bg-purple-500/20" : "bg-[var(--muted)]/10"}`}
        >
          JSON
        </button>
      </div>

      {/* Data Display */}
      {viewMode === "json" ? (
        <div className="p-3 rounded bg-[var(--muted)]/10 text-xs max-h-96 overflow-auto">
          <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <div className="overflow-auto max-h-96">
          {Array.isArray(data) ? (
            <table className="w-full text-xs">
              <thead className="bg-[var(--muted)]/20">
                <tr>
                  {Object.keys(data[0] || {}).map((key) => (
                    <th key={key} className="px-3 py-2 text-left font-medium">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    {Object.values(item as Record<string, unknown>).map((value, j) => (
                      <td key={j} className="px-3 py-2">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-3 rounded bg-[var(--muted)]/10">
              {typeof data === "object" && data !== null ? (
                Object.entries(data as Record<string, unknown>).map(([key, value]) => (
                  <div key={key} className="flex gap-2 py-1">
                    <span className="text-xs font-medium text-purple-400">{key}:</span>
                    <span className="text-xs">{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs">{String(data)}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExportCard({
  result,
  onExport,
  hasAIData
}: {
  result: ScrapeResult;
  onExport: (format: "json" | "csv" | "markdown") => void;
  hasAIData: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted-foreground)]">
        Download scraped data in your preferred format
      </p>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onExport("json")}
          className="p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)]/20 transition-colors text-center"
        >
          <div className="text-2xl mb-1">{ }</div>
          <p className="text-sm font-medium">JSON</p>
          <p className="text-xs text-[var(--muted-foreground)]">Structured data</p>
        </button>

        <button
          onClick={() => onExport("csv")}
          disabled={!hasAIData}
          className={`p-4 rounded-lg border border-[var(--border)] transition-colors text-center ${
            hasAIData ? "hover:bg-[var(--muted)]/20" : "opacity-50 cursor-not-allowed"
          }`}
        >
          <div className="text-2xl mb-1"></div>
          <p className="text-sm font-medium">CSV</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            {hasAIData ? "Spreadsheet" : "Needs AI data"}
          </p>
        </button>

        <button
          onClick={() => onExport("markdown")}
          className="p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)]/20 transition-colors text-center"
        >
          <div className="text-2xl mb-1">#</div>
          <p className="text-sm font-medium">Markdown</p>
          <p className="text-xs text-[var(--muted-foreground)]">LLM-ready</p>
        </button>
      </div>

      {/* Quick Copy */}
      <div className="pt-4 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--muted-foreground)] mb-2">Quick Copy</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(result.text)}
          >
            Copy Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(result.url)}
          >
            Copy URL
          </Button>
          {hasAIData && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(result.aiExtraction?.data, null, 2))}
            >
              Copy AI Data
            </Button>
          )}
        </div>
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
      {item.result.aiExtraction && (
        <Badge className="mt-1 bg-purple-500/10 text-purple-400 text-xs">
          AI extracted
        </Badge>
      )}
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
