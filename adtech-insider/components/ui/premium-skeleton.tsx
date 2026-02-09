"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PremiumSkeletonProps extends React.ComponentProps<"div"> {
  variant?: "card" | "chart" | "table" | "list";
}

export function PremiumSkeleton({
  className,
  variant = "card",
  ...props
}: PremiumSkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-muted/40 border border-border/40",
        variant === "card" && "p-4 h-32",
        variant === "chart" && "h-[280px]",
        variant === "table" && "h-[320px]",
        variant === "list" && "h-48",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]",
          "bg-gradient-to-r from-transparent via-white/10 to-transparent",
          "dark:via-white/5"
        )}
      />
      {variant === "card" && (
        <div className="flex flex-col gap-3">
          <div className="h-4 w-24 rounded bg-muted/60" />
          <div className="h-8 w-16 rounded bg-muted/60" />
        </div>
      )}
      {variant === "chart" && (
        <div className="p-4 flex flex-col gap-4 h-full">
          <div className="h-4 w-32 rounded bg-muted/60" />
          <div className="flex-1 flex items-end gap-2">
            {[40, 70, 50, 85, 60].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-muted/50 min-h-[20px]"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      )}
      {variant === "table" && (
        <div className="p-4 flex flex-col gap-3">
          <div className="h-4 w-48 rounded bg-muted/60" />
          <div className="flex-1 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded bg-muted/40" />
            ))}
          </div>
        </div>
      )}
      {variant === "list" && (
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted/50 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-3/4 rounded bg-muted/50" />
                <div className="h-3 w-1/2 rounded bg-muted/40" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
