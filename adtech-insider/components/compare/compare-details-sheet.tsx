"use client";

import { useMemo, memo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyLogo } from "@/components/ui/company-logo";
import { MetricRow } from "@/components/ui/metric-row";
import { InsightCallout } from "@/components/ui/insight-callout";
import { TrendingUp, Zap, Activity, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanyData, CompanySlug } from "@/types";
import type { CompanyCompareMetrics } from "@/lib/compare";

interface CompareDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyData | null;
  metrics: CompanyCompareMetrics | null;
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3).trim() + "...";
}

function generateHighlights(company: CompanyData, metrics: CompanyCompareMetrics): string[] {
  const highlights: string[] = [];

  const sortedQuarters = [...company.quarterly_data].sort(
    (a, b) => b.key_activities.length - a.key_activities.length
  );
  const top2 = sortedQuarters.slice(0, 2);

  top2.forEach((q) => {
    const event = q.key_activities[0] ?? "Marketing activities";
    highlights.push(
      `In ${q.quarter}, focused on ${q.main_theme} — e.g. ${truncate(event, 80)}`
    );
  });

  const rankMap: Array<{ rankKey: keyof CompanyCompareMetrics; label: string; value: number }> = [
    { rankKey: "rankAvgBrandScore", label: "Perception", value: metrics.avgBrandScore },
    { rankKey: "rankAvgIntensity", label: "Intensity", value: metrics.avgIntensity },
    { rankKey: "rankTotalActivity", label: "Activity", value: metrics.totalActivity },
    { rankKey: "rankPeakIntensity", label: "Peak Intensity", value: metrics.peakIntensity },
  ];
  const best = rankMap.find((r) => metrics[r.rankKey] === 1);
  if (best && typeof best.value === "number") {
    highlights.push(
      `Leads in ${best.label} with ${best.value.toFixed(1)} (rank #1 among peers)`
    );
  }

  return highlights.slice(0, 3);
}

export const CompareDetailsSheet = memo(function CompareDetailsSheet({
  open,
  onOpenChange,
  company,
  metrics,
}: CompareDetailsSheetProps) {
  const highlights = useMemo(() => {
    if (!company || !metrics) return [];
    return generateHighlights(company, metrics);
  }, [company, metrics]);

  const hasData = Boolean(company && metrics);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-lg w-full overflow-y-auto"
      >
        {!hasData ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            Loading...
          </div>
        ) : (
        <>
        <SheetHeader className="pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <CompanyLogo slug={company!.id} name={company!.name} size="lg" variant="avatar" />
            <div>
              <SheetTitle>{company!.name}</SheetTitle>
              <SheetDescription>{company!.tagline}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-4 flex-1">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
            <TabsTrigger value="highlights">Highlights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">{company!.overview}</p>
            <div className="space-y-0 divide-y divide-border/60 rounded-lg border border-border/60 overflow-hidden">
              <MetricRow icon={TrendingUp} label="Avg. Perception" value={metrics!.avgBrandScore} />
              <MetricRow icon={Zap} label="Avg. Intensity" value={metrics!.avgIntensity} />
              <MetricRow icon={Activity} label="Key Activities" value={metrics!.totalActivity} />
              <MetricRow icon={BarChart3} label="Peak Intensity" value={metrics!.peakIntensity} />
            </div>
          </TabsContent>

          <TabsContent value="quarterly" className="mt-4">
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 font-medium">Quarter</th>
                    <th className="text-left p-2 font-medium">Focus</th>
                    <th className="text-left p-2 font-medium">Brand</th>
                    <th className="text-right p-2 font-medium">Activities</th>
                  </tr>
                </thead>
                <tbody>
                  {company!.quarterly_data.map((q) => (
                    <tr key={q.quarter} className="border-t border-border/60">
                      <td className="p-2">{q.quarter}</td>
                      <td className="p-2 text-muted-foreground">{truncate(q.main_theme, 24)}</td>
                      <td className="p-2 text-muted-foreground">{q.brand_perception}</td>
                      <td className="p-2 text-right font-medium">{q.key_activities.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="highlights" className="mt-4">
            <InsightCallout className="mb-4">
              AI-generated insights from quarterly data and peer comparison.
            </InsightCallout>
            <ul className="space-y-3">
              {highlights.map((h, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex gap-2 text-sm",
                    "before:content-['•'] before:text-muted-foreground before:font-bold"
                  )}
                >
                  <span className="text-foreground">{h}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
        </>
        )}
      </SheetContent>
    </Sheet>
  );
});
