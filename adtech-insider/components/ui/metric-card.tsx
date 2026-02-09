"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassCard } from "./glass-card";
import { getCompanyBrand } from "@/config/brand";
import type { CompanySlug } from "@/types";

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: CompanySlug | "default";
  sparklineData?: number[];
  sparklineColor?: string;
  className?: string;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  accent = "default",
  sparklineData,
  sparklineColor,
  className,
}: MetricCardProps) {
  const brand = accent !== "default" ? getCompanyBrand(accent) : null;

  return (
    <GlassCard
      accent={accent}
      accentBar="top"
      hover
      className={cn("p-4", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "rounded-lg p-2 shrink-0",
              brand ? "bg-primary/10" : ""
            )}
            style={
              brand
                ? {
                    backgroundColor: `${brand.gradientFrom}20`,
                    color: brand.accent,
                  }
                : undefined
            }
          >
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">
            {label}
          </span>
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <SparklineMicro data={sparklineData} color={sparklineColor} />
        )}
      </div>
      <motion.span
        className="text-2xl font-bold tabular-nums mt-2 block"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {value}
      </motion.span>
    </GlassCard>
  );
}

function SparklineMicro({
  data,
  color = "var(--primary)",
}: {
  data: number[];
  color?: string;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 48;
  const h = 24;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={w}
      height={h}
      className="opacity-60 shrink-0"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
