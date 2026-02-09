"use client";

import { useMemo, useState, useEffect, memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getCompanyBrand } from "@/config/brand";
import type { CompanyCompareMetrics } from "@/lib/compare";
import type { SortMetric } from "@/lib/compare";

interface CompareChartsProps {
  companies: CompanyCompareMetrics[];
  sortMetric: SortMetric;
  onBarClick?: (companyId: string) => void;
  onHoverCompany?: (companyId: string | null) => void;
  hoveredCompany?: string | null;
}

const SORT_TO_LABEL: Record<SortMetric, string> = {
  avgBrandScore: "Avg. Perception",
  avgIntensity: "Avg. Intensity",
  totalActivity: "Total Activities",
  peakIntensity: "Peak Intensity",
  consistency: "Consistency",
  compositeScore: "Composite Score",
};

const SORT_TO_KEY: Record<SortMetric, keyof CompanyCompareMetrics> = {
  avgBrandScore: "avgBrandScore",
  avgIntensity: "avgIntensity",
  totalActivity: "totalActivity",
  peakIntensity: "peakIntensity",
  consistency: "consistency",
  compositeScore: "compositeScore",
};

type GlassTooltipProps = {
  active?: boolean;
  payload?: readonly unknown[];
  label?: string | number;
  onHover?: (id: string | null) => void;
} & Record<string, unknown>;

function GlassTooltip({ active, payload, label, onHover }: GlassTooltipProps) {
  const first = payload?.[0] as { payload?: { id?: string } } | undefined;
  const id = active && first?.payload?.id ? first.payload.id : null;
  useEffect(() => {
    if (typeof onHover === "function") onHover(id);
  }, [id, onHover]);
  if (!active || !payload?.length) return null;
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-background/95 backdrop-blur-xl",
        "shadow-xl px-4 py-3 min-w-[140px] text-sm"
      )}
    >
      {label && <p className="font-semibold mb-1">{label}</p>}
      {(payload as Array<{ name?: string; value?: number }>).map((p, i) => (
        <p key={p.name ?? i} className="text-muted-foreground">
          {p.name}: <span className="font-medium text-foreground">{Number(p.value).toFixed(1)}</span>
        </p>
      ))}
    </div>
  );
}

export const CompareCharts = memo(function CompareCharts({
  companies,
  sortMetric,
  onBarClick,
  onHoverCompany,
  hoveredCompany,
}: CompareChartsProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const rankedData = useMemo(() => {
    const key = SORT_TO_KEY[sortMetric];
    return companies.map((c) => ({
      name: c.name,
      value: c[key] as number,
      id: c.id,
    }));
  }, [companies, sortMetric]);

  const radarData = useMemo(() => {
    const toChart = (n: number): number => {
      const v = Number(n);
      return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0;
    };
    return companies.map((c) => ({
      company: c.name,
      id: c.id,
      perception: toChart(c.normalizedBrandScore),
      intensity: toChart(c.normalizedIntensity),
      activity: toChart(c.normalizedActivity),
      peak: toChart(c.normalizedPeakIntensity),
    }));
  }, [companies]);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-[300px] rounded-xl bg-muted/40 animate-pulse" />
        <div className="h-[260px] rounded-xl bg-muted/40 animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="rounded-xl glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Ranked Comparison</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {SORT_TO_LABEL[sortMetric]} by company
        </p>
        <div className="h-[280px] w-full min-w-0">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={rankedData}
              layout="vertical"
              margin={{ top: 8, right: 24, bottom: 8, left: 80 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                strokeOpacity={0.4}
              />
              <XAxis
                type="number"
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                }}
                axisLine={{ stroke: "var(--border)", strokeOpacity: 0.6 }}
                tickLine={{ stroke: "var(--border)", strokeOpacity: 0.3 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={70}
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                }}
                axisLine={{ stroke: "var(--border)", strokeOpacity: 0.6 }}
                tickLine={false}
              />
              <Tooltip
                content={(props: Record<string, unknown>) => (
                  <GlassTooltip
                    active={props.active as boolean | undefined}
                    payload={props.payload as readonly unknown[] | undefined}
                    label={props.label as string | number | undefined}
                    onHover={(id) => onHoverCompany?.(id ? String(id) : null)}
                  />
                )}
                cursor={{ fill: "var(--muted)", opacity: 0.2 }}
              />
              <Bar
                dataKey="value"
                name={SORT_TO_LABEL[sortMetric]}
                radius={[0, 4, 4, 0]}
                onClick={(data) => data?.id && onBarClick?.(String(data.id))}
                cursor={onBarClick ? "pointer" : undefined}
              >
                {rankedData.map((entry) => {
                  const brand = getCompanyBrand(entry.id);
                  const isHovered = hoveredCompany === entry.id;
                  const isDimmed = hoveredCompany != null && !isHovered;
                  return (
                    <Cell
                      key={entry.id}
                      fill={brand.gradientFrom}
                      stroke={brand.accent}
                      strokeWidth={isHovered ? 2 : 1}
                      opacity={isDimmed ? 0.4 : 1}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Normalized Metrics</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Relative scores (0–100) across perception, intensity, activity, and peak
        </p>
        <div className="h-[280px] w-full min-w-0 overflow-x-auto">
          <ResponsiveContainer width="100%" height={280} minWidth={400}>
            <BarChart
              data={radarData}
              margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="company"
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 10,
                }}
                axisLine={{ stroke: "var(--border)", strokeOpacity: 0.6 }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 10,
                }}
                axisLine={{ stroke: "var(--border)", strokeOpacity: 0.6 }}
                tickLine={{ stroke: "var(--border)", strokeOpacity: 0.3 }}
              />
              <Tooltip
                content={<GlassTooltip />}
                cursor={{ fill: "var(--muted)", opacity: 0.2 }}
              />
              <Legend />
              <Bar dataKey="perception" name="Perception" fill="var(--accent-taboola)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="intensity" name="Intensity" fill="var(--accent-teads)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="activity" name="Activity" fill="var(--accent-ttd)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="peak" name="Peak" fill="var(--accent-simplifi)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
});
