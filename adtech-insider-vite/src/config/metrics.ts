import type { Company, CompanyMetrics } from "@/types/company";

export type MetricKey = "activity" | "intensity" | "peak" | "perception";

export interface MetricConfig {
  label: string;
  color: string;
  accessor: (m: CompanyMetrics) => number;
}

export const METRIC_CONFIG: Record<MetricKey, MetricConfig> = {
  activity: {
    label: "Activity",
    color: "#3b82f6",
    accessor: (m) => m.activityCount,
  },
  intensity: {
    label: "Intensity",
    color: "#a855f7",
    accessor: (m) => m.intensityAvg,
  },
  peak: {
    label: "Peak",
    color: "#22c55e",
    accessor: (m) => m.peakScore,
  },
  perception: {
    label: "Perception",
    color: "#14b8a6",
    accessor: (m) => m.perceptionAvg,
  },
};

export function getMetricValue(company: Company, key: MetricKey): number {
  return METRIC_CONFIG[key].accessor(company.metrics);
}
