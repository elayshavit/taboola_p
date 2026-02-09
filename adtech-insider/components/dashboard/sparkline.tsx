"use client";

import { memo, useState, useEffect } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  className?: string;
  color?: string;
  trend?: "up" | "down" | "neutral";
}

export const Sparkline = memo(function Sparkline({
  data,
  className,
  color = "hsl(var(--chart-1))",
  trend = "neutral",
}: SparklineProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const chartData = data.map((v, i) => ({ value: v, index: i }));

  if (!mounted) {
    return <div className={cn("h-8 w-16 bg-muted/40 rounded animate-pulse", className)} />;
  }

  return (
    <div className={cn("h-8 w-16", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
