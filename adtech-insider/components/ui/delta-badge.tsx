"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type DeltaVariant = "up" | "down" | "neutral";

interface DeltaBadgeProps {
  variant: DeltaVariant;
  value: string;
  className?: string;
}

const variantStyles: Record<
  DeltaVariant,
  { icon: React.ElementType; className: string }
> = {
  up: {
    icon: TrendingUp,
    className: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  },
  down: {
    icon: TrendingDown,
    className: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
  },
  neutral: {
    icon: Minus,
    className: "text-muted-foreground bg-muted/50",
  },
};

export function DeltaBadge({ variant, value, className }: DeltaBadgeProps) {
  const { icon: Icon, className: variantClass } = variantStyles[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium",
        variantClass,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {value}
    </span>
  );
}
