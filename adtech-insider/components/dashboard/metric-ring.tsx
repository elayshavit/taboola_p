"use client";

import { memo, useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
}

export const MetricRing = memo(function MetricRing({
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  className,
  color = "oklch(0.6 0.22 264)",
}: MetricRingProps) {
  const id = useId();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const normalized = Math.min(Math.max(value, 0), max);
  const offset = circumference - (normalized / max) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className={cn("rotate-[-90deg]", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`ring-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.9} />
          <stop offset="100%" stopColor={color} stopOpacity={0.5} />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/40"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`url(#ring-gradient-${id})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  );
});
