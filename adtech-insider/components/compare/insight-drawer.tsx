"use client";

import { useMemo, useState, useEffect } from "react";
import { Drawer } from "vaul";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Zap,
  Activity,
  BarChart3,
  Sparkles,
  X,
} from "lucide-react";
import { CompanyLogo } from "@/components/ui/company-logo";
import { MetricRow } from "@/components/ui/metric-row";
import { cn } from "@/lib/utils";
import type { CompanyData } from "@/types";
import type { CompanyCompareMetrics } from "@/lib/compare";

interface InsightDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyData | null;
  metrics: CompanyCompareMetrics | null;
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3).trim() + "...";
}

function generateInsights(
  company: CompanyData,
  metrics: CompanyCompareMetrics
): string[] {
  const bullets: string[] = [];
  const sorted = [...company.quarterly_data].sort(
    (a, b) => b.key_activities.length - a.key_activities.length
  );
  sorted.slice(0, 2).forEach((q) => {
    const event = q.key_activities[0] ?? "Marketing activities";
    bullets.push(
      `In ${q.quarter}, focused on ${q.main_theme} — e.g. ${truncate(event, 70)}`
    );
  });
  const rankMap: Array<{ rankKey: keyof CompanyCompareMetrics; label: string; value: number }> = [
    { rankKey: "rankAvgBrandScore", label: "Perception", value: metrics.avgBrandScore },
    { rankKey: "rankAvgIntensity", label: "Intensity", value: metrics.avgIntensity },
    { rankKey: "rankTotalActivity", label: "Activity", value: metrics.totalActivity },
    { rankKey: "rankPeakIntensity", label: "Peak Intensity", value: metrics.peakIntensity },
  ];
  const best = rankMap.find((r) => metrics[r.rankKey] === 1);
  if (best) {
    bullets.push(
      `Leads in ${best.label} with ${best.value.toFixed(1)} (rank #1 among peers)`
    );
  }
  return bullets.slice(0, 3);
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

export function InsightDrawer({
  open,
  onOpenChange,
  company,
  metrics,
}: InsightDrawerProps) {
  const isDesktop = useIsDesktop();
  const insights = useMemo(() => {
    if (!company || !metrics) return [];
    return generateInsights(company, metrics);
  }, [company, metrics]);

  const hasData = Boolean(company && metrics);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      direction={isDesktop ? "right" : "bottom"}
      snapPoints={isDesktop ? [1] : [0.6, 0.9]}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Drawer.Content
          className={cn(
            "fixed z-50 flex flex-col",
            "bg-background/95 backdrop-blur-xl border border-border/60",
            "glass-card",
            isDesktop
              ? "right-0 top-0 h-full w-full max-w-md shadow-2xl"
              : "bottom-0 left-0 right-0 max-h-[90vh] rounded-t-2xl"
          )}
        >
          {!isDesktop && <Drawer.Handle className="mx-auto mt-2 h-1 w-12 rounded-full bg-muted-foreground/30" />}
          <div className="flex-1 overflow-y-auto p-6">
            {!hasData ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                Loading...
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CompanyLogo
                      slug={company!.id}
                      name={company!.name}
                      size="lg"
                      variant="avatar"
                    />
                    <div>
                      <h2 className="font-semibold text-lg">{company!.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {company!.tagline}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="rounded-lg p-2 hover:bg-muted"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-border/60 divide-y divide-border/60 overflow-hidden">
                    <MetricRow
                      icon={TrendingUp}
                      label="Avg. Perception"
                      value={metrics!.avgBrandScore}
                    />
                    <MetricRow
                      icon={Zap}
                      label="Avg. Intensity"
                      value={metrics!.avgIntensity}
                    />
                    <MetricRow
                      icon={Activity}
                      label="Key Activities"
                      value={metrics!.totalActivity}
                    />
                    <MetricRow
                      icon={BarChart3}
                      label="Peak Intensity"
                      value={metrics!.peakIntensity}
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Quarterly snapshot
                    </h3>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {company!.quarterly_data.map((q) => (
                        <div
                          key={q.quarter}
                          className="shrink-0 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 min-w-[120px]"
                        >
                          <p className="text-xs font-medium text-muted-foreground">
                            {q.quarter}
                          </p>
                          <p className="text-sm font-medium truncate">
                            {q.main_theme}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {q.key_activities.length} activities
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Insights</h3>
                    <ul className="space-y-2">
                      {insights.map((h, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-sm before:content-['•'] before:text-primary before:font-bold"
                        >
                          <span className="text-foreground">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
