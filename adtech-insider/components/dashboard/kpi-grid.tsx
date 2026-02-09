"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Zap, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricRing } from "./metric-ring";
import { Sparkline } from "./sparkline";
import { cn } from "@/lib/utils";
import { getCompanyBrand } from "@/config/brand";
import type { CompanyData, CompanySlug } from "@/types";

interface KpiGridProps {
  company: CompanyData;
  isLoading?: boolean;
}

function computeKpis(company: CompanyData) {
  const q = company.quarterly_data;
  const avgPerception =
    q.reduce((sum, d) => sum + d.perception_score, 0) / q.length;
  const avgIntensity =
    q.reduce((sum, d) => sum + d.marketing_intensity_score, 0) / q.length;
  const totalActivities = q.reduce(
    (sum, d) => sum + d.key_activities.length,
    0
  );
  const perceptionTrend = q.map((d) => d.perception_score);
  const intensityTrend = q.map((d) => d.marketing_intensity_score);
  return {
    avgPerception: Math.round(avgPerception),
    avgIntensity: Math.round(avgIntensity),
    totalActivities,
    perceptionTrend,
    intensityTrend,
  };
}

const KpiTile = memo(function KpiTile({
  icon: Icon,
  label,
  value,
  trend,
  ring,
  color,
  gradientFrom,
  gradientTo,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  trend?: number[];
  ring?: { value: number; color: string };
  color: string;
  gradientFrom: string;
  gradientTo: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "glass-card glass-card-hover rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden",
        "border-border/60"
      )}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
        }}
        aria-hidden
      />
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="rounded-lg p-2"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        {trend && trend.length > 0 && (
          <Sparkline data={trend} color={color} className="opacity-70" />
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-bold">{value}</span>
        {ring && (
          <MetricRing
            value={ring.value}
            size={48}
            strokeWidth={4}
            color={color}
          />
        )}
      </div>
    </motion.div>
  );
});

export const KpiGrid = memo(function KpiGrid({
  company,
  isLoading = false,
}: KpiGridProps) {
  const brand = getCompanyBrand(company.id as CompanySlug);
  const kpis = useMemo(() => computeKpis(company), [company]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            className="h-32 rounded-xl"
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
    >
      <KpiTile
        icon={TrendingUp}
        label="Avg. Perception"
        value={kpis.avgPerception}
        trend={kpis.perceptionTrend}
        ring={{ value: kpis.avgPerception, color: brand.accent }}
        color={brand.accent}
        gradientFrom={brand.gradientFrom}
        gradientTo={brand.gradientTo}
      />
      <KpiTile
        icon={Zap}
        label="Avg. Marketing Intensity"
        value={kpis.avgIntensity}
        trend={kpis.intensityTrend}
        ring={{ value: kpis.avgIntensity, color: brand.accent }}
        color={brand.accent}
        gradientFrom={brand.gradientFrom}
        gradientTo={brand.gradientTo}
      />
      <KpiTile
        icon={BarChart3}
        label="Activity"
        value={kpis.totalActivities}
        color={brand.accent}
        gradientFrom={brand.gradientFrom}
        gradientTo={brand.gradientTo}
      />
    </motion.div>
  );
});
