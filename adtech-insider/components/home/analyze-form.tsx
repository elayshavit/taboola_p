"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

function toSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    // Preserve non-Latin characters but normalize whitespace and dashes
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-]+|[-]+$/g, "");
}

export function AnalyzeForm() {
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = toSlug(input);
    if (!slug) return;
    router.push(`/company/${encodeURIComponent(slug)}`);
  };

  const isDisabled = input.trim().length === 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-xl mx-auto"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="company-input"
          className="text-sm font-medium text-muted-foreground"
        >
          Enter any company name
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="company-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Taboola, Criteo, Adobe..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="gap-2 shrink-0"
            disabled={isDisabled}
          >
            <Sparkles className="h-4 w-4" />
            Analyze
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Our AI will search for 2025 marketing strategy, news, and campaigns.
        </p>
      </div>
    </form>
  );
}
