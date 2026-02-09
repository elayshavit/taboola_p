"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Crown, TrendingUp, Zap, BarChart3, Activity } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { CompanyLogo } from "@/components/ui/company-logo";
import { MetricRow } from "@/components/ui/metric-row";
import type { CompanyCompareMetrics } from "@/lib/compare";

function formatValue(value: number, asInteger?: boolean): string | number {
  if (asInteger || Number.isInteger(value)) return Math.round(value);
  return Math.round(value * 10) / 10;
}

interface CompanyCompareCardProps {
  metrics: CompanyCompareMetrics;
  onClick: () => void;
}

export const CompanyCompareCard = memo(function CompanyCompareCard({
  metrics,
  onClick,
}: CompanyCompareCardProps) {
  const isBestPerception = metrics.rankAvgBrandScore === 1;
  const isBestIntensity = metrics.rankAvgIntensity === 1;
  const isBestActivity = metrics.rankTotalActivity === 1;
  const isBestPeak = metrics.rankPeakIntensity === 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="h-full"
    >
      <GlassCard
        accent={metrics.id}
        accentBar="top"
        hover
        className="h-full cursor-pointer p-0"
      >
        <button
          type="button"
          onClick={onClick}
          className="w-full h-full text-left p-5 flex flex-col"
        >
          <div className="flex items-start gap-3 mb-4">
            <CompanyLogo slug={metrics.id} name={metrics.name} size="lg" variant="avatar" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg truncate">{metrics.name}</h3>
                {(isBestPerception || isBestIntensity || isBestActivity) && (
                  <Crown className="h-4 w-4 shrink-0 text-amber-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {metrics.tagline}
              </p>
            </div>
          </div>

          <div className="space-y-0 divide-y divide-border/60">
            <MetricRow
              icon={TrendingUp}
              label="Avg. Perception"
              value={formatValue(metrics.avgBrandScore)}
              delta={isBestPerception ? "up" : undefined}
              deltaValue={isBestPerception ? "#1" : undefined}
            />
            <MetricRow
              icon={Zap}
              label="Avg. Intensity"
              value={formatValue(metrics.avgIntensity)}
              delta={isBestIntensity ? "up" : undefined}
              deltaValue={isBestIntensity ? "#1" : undefined}
            />
            <MetricRow
              icon={Activity}
              label="Key Activities"
              value={formatValue(metrics.totalActivity, true)}
              delta={isBestActivity ? "up" : undefined}
              deltaValue={isBestActivity ? "#1" : undefined}
            />
            <MetricRow
              icon={BarChart3}
              label="Peak"
              value={formatValue(metrics.peakIntensity, true)}
              delta={isBestPeak ? "up" : undefined}
              deltaValue={isBestPeak ? "#1" : undefined}
            />
          </div>
        </button>
      </GlassCard>
    </motion.div>
  );
});
