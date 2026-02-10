"use client";

import { useMemo, useId, memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { getCompanyBrand } from "@/config/brand";
import { cn } from "@/lib/utils";
import type { CompanyData, CompanySlug } from "@/types";

interface BubbleChartProps {
  company: CompanyData;
}

interface ChartPoint {
  quarter: string;
  quarterIndex: number;
  perceptionScore: number;
  brandLabel: string;
  marketingIntensity: number;
  activitiesCount: number;
  topHighlights: string[];
}

function CustomTooltipContent({
  active,
  payload,
  companyName,
  accentColor,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  companyName: string;
  accentColor: string;
}) {
  if (!active || !payload?.[0]) return null;
  const p = payload[0].payload;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "rounded-xl glass-card p-4 min-w-[240px]",
        "border shadow-xl"
      )}
      style={{ borderColor: `${accentColor}40` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {companyName.charAt(0)}
        </div>
        <p className="font-semibold text-foreground">{p.quarter}</p>
      </div>
      <div className="space-y-1.5 text-sm">
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">Brand:</span> {p.brandLabel} ({p.perceptionScore})
        </p>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">Marketing intensity:</span> {p.marketingIntensity}
        </p>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">Key activities:</span> {p.activitiesCount}
        </p>
        {p.topHighlights.length > 0 && (
          <div className="pt-2 border-t border-border/60">
            <p className="text-xs font-medium text-muted-foreground mb-1">Top highlights</p>
            <ul className="text-xs space-y-0.5">
              {p.topHighlights.slice(0, 2).map((h, i) => (
                <li key={i} className="line-clamp-2">• {h}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export const BubbleChart = memo(function BubbleChart({ company }: BubbleChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const brand = getCompanyBrand(company.id as CompanySlug);
  const uniqueId = useId().replace(/:/g, "-");

  const data: ChartPoint[] = useMemo(() => {
    const qData = company.quarterly_data ?? [];
    return qData.map((q, i) => ({
      quarter: q.quarter,
      quarterIndex: i,
      perceptionScore: q.perception_score,
      brandLabel: q.brand_perception,
      marketingIntensity: q.marketing_intensity_score,
      activitiesCount: q.key_activities?.length ?? 0,
      topHighlights: (q.key_activities ?? []).slice(0, 3),
    }));
  }, [company]);

  const minRadius = 70;
  const maxRadius = 160;

  if (!mounted) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={cn(
          "rounded-xl glass-card p-6",
          "border-border/60"
        )}
      >
        <h2 className="text-lg font-semibold mb-4">
          Brand Perception & Marketing Intensity
        </h2>
        <div className="h-[340px] w-full rounded-lg bg-muted/40 animate-pulse" />
        <p className="text-muted-foreground text-xs mt-3">
          X: Quarter · Y: Perception score · Size: Marketing intensity
        </p>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn(
        "rounded-xl glass-card p-6",
        "border-border/60"
      )}
    >
      <h2 className="text-lg font-semibold mb-4">
        Brand Perception & Marketing Intensity
      </h2>

      <div className="h-[340px] min-h-[340px] w-full min-w-0">
        <ResponsiveContainer width="100%" height={340} minHeight={340}>
          <ScatterChart margin={{ top: 24, right: 24, bottom: 24, left: 24 }}>
            <defs>
              <filter
                id={`bubble-glow-${uniqueId}`}
                x="-80%"
                y="-80%"
                width="260%"
                height="260%"
              >
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter
                id={`bubble-shadow-${uniqueId}`}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
              </filter>
              <linearGradient
                id={`bubble-gradient-${uniqueId}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor={brand.gradientFrom} stopOpacity={0.95} />
                <stop offset="100%" stopColor={brand.gradientTo} stopOpacity={0.75} />
              </linearGradient>
              <linearGradient
                id={`grid-gradient-${uniqueId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>

            <XAxis
              type="category"
              dataKey="quarter"
              name="Quarter"
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 11,
                fontFamily: "inherit",
                fontWeight: 500,
              }}
              axisLine={{
                stroke: "var(--border)",
                strokeOpacity: 0.6,
              }}
              tickLine={{
                stroke: "var(--border)",
                strokeOpacity: 0.3,
              }}
            />

            <YAxis
              type="number"
              dataKey="perceptionScore"
              name="Perception Score"
              domain={[70, 100]}
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 11,
                fontFamily: "inherit",
                fontWeight: 500,
              }}
              axisLine={{
                stroke: "var(--border)",
                strokeOpacity: 0.6,
              }}
              tickLine={{
                stroke: "var(--border)",
                strokeOpacity: 0.3,
              }}
            />

            <ZAxis
              type="number"
              dataKey="marketingIntensity"
              range={[minRadius, maxRadius]}
              name="Marketing Intensity"
            />

            <Tooltip
              content={
                <CustomTooltipContent
                  companyName={company.name}
                  accentColor={brand.accent}
                />
              }
              cursor={{
                stroke: brand.accent,
                strokeWidth: 1,
                strokeDasharray: "4 4",
                strokeOpacity: 0.5,
              }}
            />

            <Scatter
              data={data}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#bubble-gradient-${uniqueId})`}
                  stroke={brand.accent}
                  strokeWidth={1.5}
                  filter={`url(#bubble-glow-${uniqueId}) url(#bubble-shadow-${uniqueId})`}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <p className="text-muted-foreground text-xs mt-3">
        X: Quarter · Y: Perception score · Size: Marketing intensity
      </p>
    </motion.section>
  );
});
