"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCompanyBrand } from "@/config/brand";
import { CompanyLogo } from "@/components/ui/company-logo";
import { getCompanyMetrics } from "@/data/companiesMetrics";
import type { CompanyData, CompanySlug } from "@/types";

interface HeroHeaderProps {
  company: CompanyData;
}

function computeKpis(company: CompanyData) {
  const m = getCompanyMetrics(company.id);
  if (m) {
    return {
      perception: m.perception,
      intensity: m.intensity,
      activities: m.activity,
    };
  }
  const q = company.quarterly_data;
  const avgPerception =
    q.reduce((sum, d) => sum + d.perception_score, 0) / q.length;
  const avgIntensity =
    q.reduce((sum, d) => sum + d.marketing_intensity_score, 0) / q.length;
  const totalActivities = q.reduce(
    (sum, d) => sum + d.key_activities.length,
    0
  );
  return {
    perception: Math.round(avgPerception),
    intensity: Math.round(avgIntensity),
    activities: totalActivities,
  };
}

const KpiChip = memo(function KpiChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-1.5",
        "bg-muted/60 border border-border/60 text-sm"
      )}
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-muted-foreground font-medium">{label}:</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
});

export const HeroHeader = memo(function HeroHeader({ company }: HeroHeaderProps) {
  const brand = getCompanyBrand(company.id as CompanySlug);
  const kpis = computeKpis(company);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-xl glass-card p-6 md:p-8",
        "noise-bg"
      )}
    >
      {/* Subtle animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.08] blur-3xl"
          style={{
            background: `radial-gradient(circle, ${brand.gradientFrom}, transparent)`,
          }}
          animate={{
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full opacity-[0.06] blur-3xl"
          style={{
            background: `radial-gradient(circle, ${brand.gradientTo}, transparent)`,
          }}
          animate={{
            x: [0, -8, 0],
            y: [0, 8, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <CompanyLogo
                  slug={company.id}
                  name={company.name}
                  size="hero"
                  variant="badge"
                />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {company.name}
                </h1>
                <p className="text-muted-foreground text-sm">{company.tagline}</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex flex-wrap items-center gap-2"
          >
            <div
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium",
                "border flex items-center gap-1.5"
              )}
              style={{
                borderColor: `${brand.accent}40`,
                background: `linear-gradient(90deg, ${brand.accentLight}25, ${brand.accent}15)`,
              }}
            >
              <Sparkles className="h-3 w-3" style={{ color: brand.accent }} />
              <span>2025 Strategy</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <KpiChip icon={TrendingUp} label="Perception" value={kpis.perception} />
              <KpiChip icon={Zap} label="Intensity" value={kpis.intensity} />
              <KpiChip icon={BarChart3} label="Activity" value={kpis.activities} />
            </div>
          </motion.div>
        </div>

        <p className="mt-5 text-muted-foreground text-sm leading-relaxed max-w-3xl">
          {company.strategy_2025_summary}
        </p>
      </div>
    </motion.section>
  );
});
