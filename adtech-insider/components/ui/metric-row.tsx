"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DeltaBadge } from "./delta-badge";

interface MetricRowProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  delta?: "up" | "down" | "neutral";
  deltaValue?: string;
  className?: string;
}

export function MetricRow({
  icon: Icon,
  label,
  value,
  delta,
  deltaValue,
  className,
}: MetricRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-2",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm text-muted-foreground truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold tabular-nums">{value}</span>
        {delta && deltaValue && (
          <DeltaBadge variant={delta} value={deltaValue} />
        )}
      </div>
    </div>
  );
}
