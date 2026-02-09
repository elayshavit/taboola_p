"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightCalloutProps {
  children: React.ReactNode;
  className?: string;
}

export function InsightCallout({ children, className }: InsightCalloutProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm",
        className
      )}
    >
      <Sparkles className="h-4 w-4 shrink-0 text-primary mt-0.5" />
      <span className="text-foreground/90">{children}</span>
    </div>
  );
}
