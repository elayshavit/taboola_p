/**
 * Canonical metric definitions - single source of truth for compare aggregation.
 * All metrics use direct numeric scores from input/canonical data; no derivation.
 */

export const METRIC_KEYS = ["perception", "intensity", "activity", "peak"] as const;
export type MetricKey = (typeof METRIC_KEYS)[number];

export interface MetricDefinition {
  label: string;
  aggregation: "average" | "sum" | "max";
  expectedRange: { min: number; max: number };
}

export const METRIC_DEFINITIONS: Record<MetricKey, MetricDefinition> = {
  perception: {
    label: "Perception",
    aggregation: "average",
    expectedRange: { min: 0, max: 100 },
  },
  intensity: {
    label: "Intensity",
    aggregation: "average",
    expectedRange: { min: 0, max: 100 },
  },
  activity: {
    label: "Activity",
    aggregation: "sum",
    expectedRange: { min: 0, max: 200 },
  },
  peak: {
    label: "Peak",
    aggregation: "max",
    expectedRange: { min: 0, max: 100 },
  },
};

export function isValidFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
