import type { QuarterOption } from "@/store/use-compare-store";
import type { MetricWeights } from "@/store/use-compare-store";
import type { CanonicalCompanyData } from "@/lib/schema";
import { isValidFiniteNumber, type MetricKey } from "@/lib/metrics";
import { getCompanyMetrics } from "@/data/companiesMetrics";

export type QuarterFocus = "all" | "Q1 2025" | "Q2 2025" | "Q3 2025" | "Q4 2025";

export type SortMetric =
  | "avgBrandScore"
  | "avgIntensity"
  | "totalActivity"
  | "peakIntensity"
  | "consistency"
  | "compositeScore";

/** Map MetricKey (store) to SortMetric (lib) */
export const METRIC_KEY_TO_SORT: Record<string, SortMetric> = {
  brand: "avgBrandScore",
  innovation: "avgIntensity",
  presence: "avgBrandScore",
  activity: "totalActivity",
  peak: "peakIntensity",
  consistency: "consistency",
} as const;

export interface MetricWarnings {
  companyId: string;
  metric: MetricKey;
  message: string;
}

export interface CompareDebugInfo {
  normBounds: {
    perception: { min: number; max: number };
    intensity: { min: number; max: number };
    activity: { min: number; max: number };
    peak: { min: number; max: number };
  };
  warnings: MetricWarnings[];
}

export interface CompanyCompareMetrics {
  id: string;
  name: string;
  tagline: string;
  avgBrandScore: number;
  avgInnovation: number;
  avgPresence: number;
  avgIntensity: number;
  totalActivity: number;
  peakIntensity: number;
  consistency: number;
  compositeScore: number;
  rankAvgBrandScore: number;
  rankAvgIntensity: number;
  rankTotalActivity: number;
  rankPeakIntensity: number;
  rankConsistency: number;
  rankCompositeScore: number;
  normalizedBrandScore: number;
  normalizedIntensity: number;
  normalizedActivity: number;
  normalizedPeakIntensity: number;
  warnings: string[];
}

const QUARTERS_2025 = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"] as const;

function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sqDiffs = values.map((v) => (v - mean) ** 2);
  return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Min-max normalize value to 0-100.
 * When max === min: set all to 50 (consistent behavior; see spec).
 */
function minMaxNormTo100(value: number, min: number, max: number): number {
  if (!isValidFiniteNumber(value)) return 50;
  if (!isValidFiniteNumber(min) || !isValidFiniteNumber(max)) return 50;
  if (max === min) return 50;
  const n = (value - min) / (max - min);
  const scaled = n * 100;
  return isValidFiniteNumber(scaled) ? Math.max(0, Math.min(100, scaled)) : 50;
}

function computeRank(value: number, allValues: number[], higherIsBetter: boolean): number {
  const sorted = [...allValues].sort((a, b) => (higherIsBetter ? b - a : a - b));
  const idx = sorted.indexOf(value);
  return idx >= 0 ? idx + 1 : 1;
}

function resolveQuarters(quarterFocus: QuarterOption | QuarterOption[]): readonly string[] {
  if (Array.isArray(quarterFocus)) {
    if (quarterFocus.length === 0 || quarterFocus.includes("all")) return QUARTERS_2025;
    return quarterFocus as readonly string[];
  }
  return quarterFocus === "all" ? QUARTERS_2025 : [quarterFocus];
}

/** Map "Q1 2025" to "Q1" for canonical quarter matching */
function toCanonicalQuarter(q: string): string {
  const m = q.match(/Q([1-4])/i);
  return m ? `Q${m[1]}` : q;
}

export interface ComputeCompareMetricsResult {
  metrics: CompanyCompareMetrics[];
  debugInfo: CompareDebugInfo;
}

export function computeCompareMetrics(
  companies: CanonicalCompanyData[],
  quarterFocus: QuarterOption | QuarterOption[],
  weights: MetricWeights = { brand: 40, innovation: 20, presence: 20, activity: 20 },
  normalize = true
): ComputeCompareMetricsResult {
  const quarters = resolveQuarters(quarterFocus);
  const canonicalQuarters = new Set(quarters.map(toCanonicalQuarter));
  const allWarnings: MetricWarnings[] = [];

  const rawMetrics: Array<{
    id: string;
    name: string;
    tagline: string;
    rawPerception: number | null;
    rawIntensity: number | null;
    rawActivity: number | null;
    rawPeak: number | null;
    consistency: number;
    nominalComposite: number | null;
    fromNominal: boolean;
    warnings: string[];
  }> = [];

  for (const c of companies) {
    const nominal = getCompanyMetrics(c.slug);
    const companyWarnings: string[] = [];

    let rawPerception: number | null;
    let rawIntensity: number | null;
    let rawActivity: number | null;
    let rawPeak: number | null;
    let consistency: number;
    let nominalComposite: number | null = null;

    if (nominal) {
      rawPerception = nominal.perception;
      rawIntensity = nominal.intensity;
      rawActivity = nominal.activity;
      rawPeak = nominal.peak;
      consistency = nominal.consistency;
      nominalComposite = nominal.composite;
    } else {
      nominalComposite = null;
      const qData = c.quarterlyData.filter((q) => canonicalQuarters.has(q.quarter));
      const perceptionScores = qData.map((q) => q.perceptionScore);
      const avgPerception =
        perceptionScores.length > 0
          ? perceptionScores.reduce((a, b) => a + b, 0) / perceptionScores.length
          : null;
      rawPerception = avgPerception != null && isValidFiniteNumber(avgPerception)
        ? Math.round(avgPerception * 10) / 10
        : null;
      if (rawPerception === null && qData.length > 0) {
        companyWarnings.push("perception: missing or invalid");
        allWarnings.push({
          companyId: c.slug,
          metric: "perception",
          message: "missing or invalid perception_score in quarters",
        });
      }

      const intensityScores = qData.map((q) => q.intensityScore);
      const avgIntensity =
        intensityScores.length > 0
          ? intensityScores.reduce((a, b) => a + b, 0) / intensityScores.length
          : null;
      rawIntensity = avgIntensity != null && isValidFiniteNumber(avgIntensity)
        ? Math.round(avgIntensity * 10) / 10
        : null;
      if (rawIntensity === null && qData.length > 0) {
        companyWarnings.push("intensity: missing or invalid");
        allWarnings.push({
          companyId: c.slug,
          metric: "intensity",
          message: "missing or invalid marketing_intensity_score in quarters",
        });
      }

      const activityPerQuarter = qData.map(
        (q) => (q.events?.length ?? 0) + (q.reportsPublished?.length ?? 0)
      );
      const totalActivity = activityPerQuarter.reduce((a, b) => a + b, 0);
      rawActivity = isValidFiniteNumber(totalActivity) ? totalActivity : null;
      if (rawActivity === null) {
        companyWarnings.push("activity: missing or invalid");
        allWarnings.push({
          companyId: c.slug,
          metric: "activity",
          message: "invalid activity sum",
        });
      }

      const peakRaw =
        activityPerQuarter.length > 0 ? Math.max(...activityPerQuarter) : null;
      rawPeak = peakRaw != null && isValidFiniteNumber(peakRaw) ? peakRaw : null;
      if (rawPeak === null && qData.length > 0) {
        companyWarnings.push("peak: missing or invalid");
        allWarnings.push({
          companyId: c.slug,
          metric: "peak",
          message: "invalid peak activity",
        });
      }

      const consistencyRaw = stdDev(perceptionScores.filter(isValidFiniteNumber));
      const consistencyInverted = 100 - Math.min(consistencyRaw * 2, 100);
      consistency = Math.round(consistencyInverted * 10) / 10;
    }

    rawMetrics.push({
      id: c.slug,
      name: c.companyName,
      tagline: c.tagline,
      rawPerception,
      rawIntensity,
      rawActivity,
      rawPeak,
      consistency,
      nominalComposite,
      fromNominal: !!nominal,
      warnings: companyWarnings,
    });
  }

  // Bounds for normalization (activity and peak only when normalize ON)
  const validPerception = rawMetrics
    .map((m) => m.rawPerception)
    .filter((v): v is number => v !== null);
  const validIntensity = rawMetrics
    .map((m) => m.rawIntensity)
    .filter((v): v is number => v !== null);
  const validActivity = rawMetrics
    .map((m) => m.rawActivity)
    .filter((v): v is number => v !== null);
  const validPeak = rawMetrics
    .map((m) => m.rawPeak)
    .filter((v): v is number => v !== null);

  const normBounds = {
    perception: {
      min: validPerception.length > 0 ? Math.min(...validPerception) : 0,
      max: validPerception.length > 0 ? Math.max(...validPerception) : 100,
    },
    intensity: {
      min: validIntensity.length > 0 ? Math.min(...validIntensity) : 0,
      max: validIntensity.length > 0 ? Math.max(...validIntensity) : 100,
    },
    activity: {
      min: validActivity.length > 0 ? Math.min(...validActivity) : 0,
      max: validActivity.length > 0 ? Math.max(...validActivity) : 1,
    },
    peak: {
      min: validPeak.length > 0 ? Math.min(...validPeak) : 0,
      max: validPeak.length > 0 ? Math.max(...validPeak) : 1,
    },
  };

  // Chart values: 0-100. No arbitrary minimums or fallbacks.
  const withChartValues = rawMetrics.map((m) => {
    let chartPerception: number;
    let chartIntensity: number;
    let chartActivity: number;
    let chartPeak: number;

    chartPerception =
      m.rawPerception != null && isValidFiniteNumber(m.rawPerception)
        ? m.rawPerception
        : 0;
    chartIntensity =
      m.rawIntensity != null && isValidFiniteNumber(m.rawIntensity)
        ? m.rawIntensity
        : 0;

    if (m.fromNominal) {
      // Nominal metrics: activity/peak already 0-100, use as-is
      chartActivity =
        m.rawActivity != null && isValidFiniteNumber(m.rawActivity)
          ? m.rawActivity
          : 0;
      chartPeak =
        m.rawPeak != null && isValidFiniteNumber(m.rawPeak) ? m.rawPeak : 0;
    } else if (normalize) {
      chartActivity =
        m.rawActivity != null && isValidFiniteNumber(m.rawActivity)
          ? minMaxNormTo100(
              m.rawActivity,
              normBounds.activity.min,
              normBounds.activity.max
            )
          : 0;
      chartPeak =
        m.rawPeak != null && isValidFiniteNumber(m.rawPeak)
          ? minMaxNormTo100(
              m.rawPeak,
              normBounds.peak.min,
              normBounds.peak.max
            )
          : 0;
    } else {
      const act =
        m.rawActivity != null && isValidFiniteNumber(m.rawActivity)
          ? m.rawActivity
          : 0;
      chartActivity = Math.min(100, act);
      const pk =
        m.rawPeak != null && isValidFiniteNumber(m.rawPeak) ? m.rawPeak : 0;
      chartPeak = Math.min(100, pk);
    }

    return {
      ...m,
      avgBrandScore: m.rawPerception ?? 0,
      avgInnovation: m.rawIntensity ?? 0,
      avgPresence: m.rawPerception ?? 0,
      avgIntensity: m.rawIntensity ?? 0,
      totalActivity: m.rawActivity ?? 0,
      peakIntensity: m.rawPeak ?? 0,
      normalizedBrandScore: chartPerception,
      normalizedIntensity: chartIntensity,
      normalizedActivity: chartActivity,
      normalizedPeakIntensity: chartPeak,
    };
  });

  const allBrand = withChartValues.map((m) => m.avgBrandScore);
  const allIntensity = withChartValues.map((m) => m.avgIntensity);
  const allActivity = withChartValues.map((m) => m.totalActivity);
  const allPeak = withChartValues.map((m) => m.peakIntensity);
  const allConsistency = withChartValues.map((m) => m.consistency);

  const compositeScores = withChartValues.map((m) => {
    if (m.nominalComposite != null && isValidFiniteNumber(m.nominalComposite)) {
      return Math.round(m.nominalComposite * 1000) / 1000;
    }
    const nBrand = normalize
      ? (m.normalizedBrandScore ?? 0) / 100
      : Math.min(1, (m.avgBrandScore ?? 0) / 100);
    const nInnov = normalize
      ? (m.normalizedIntensity ?? 0) / 100
      : Math.min(1, (m.avgIntensity ?? 0) / 100);
    const nPres = nBrand;
    const nAct = normalize
      ? (m.normalizedActivity ?? 0) / 100
      : Math.min(1, (m.totalActivity ?? 0) / 100);
    const comp =
      (nBrand * weights.brand +
        nInnov * weights.innovation +
        nPres * weights.presence +
        nAct * weights.activity) /
      100;
    return Math.round(comp * 1000) / 1000;
  });

  const metrics: CompanyCompareMetrics[] = withChartValues.map((m, i) => ({
    id: m.id,
    name: m.name,
    tagline: m.tagline,
    avgBrandScore: m.avgBrandScore,
    avgInnovation: m.avgInnovation,
    avgPresence: m.avgPresence,
    avgIntensity: m.avgIntensity,
    totalActivity: m.totalActivity,
    peakIntensity: m.peakIntensity,
    consistency: m.consistency,
    compositeScore: compositeScores[i] ?? 0,
    rankAvgBrandScore: computeRank(m.avgBrandScore, allBrand, true),
    rankAvgIntensity: computeRank(m.avgIntensity, allIntensity, true),
    rankTotalActivity: computeRank(m.totalActivity, allActivity, true),
    rankPeakIntensity: computeRank(m.peakIntensity, allPeak, true),
    rankConsistency: computeRank(m.consistency, allConsistency, true),
    rankCompositeScore: computeRank(
      compositeScores[i] ?? 0,
      compositeScores,
      true
    ),
    normalizedBrandScore: m.normalizedBrandScore,
    normalizedIntensity: m.normalizedIntensity,
    normalizedActivity: m.normalizedActivity,
    normalizedPeakIntensity: m.normalizedPeakIntensity,
    warnings: m.warnings,
  }));

  return {
    metrics,
    debugInfo: { normBounds, warnings: allWarnings },
  };
}

/** Backward-compatible: returns metrics only (for callers that don't need debugInfo) */
export function computeCompareMetricsLegacy(
  companies: CanonicalCompanyData[],
  quarterFocus: QuarterOption | QuarterOption[],
  weights?: MetricWeights,
  normalize?: boolean
): CompanyCompareMetrics[] {
  const result = computeCompareMetrics(
    companies,
    quarterFocus,
    weights ?? { brand: 40, innovation: 20, presence: 20, activity: 20 },
    normalize ?? true
  );
  return result.metrics;
}

export function sortCompareMetrics(
  metrics: CompanyCompareMetrics[],
  sortBy: SortMetric
): CompanyCompareMetrics[] {
  const key = sortBy as keyof CompanyCompareMetrics;
  const higherIsBetter = true;
  return [...metrics].sort((a, b) => {
    const va = a[key] as number;
    const vb = b[key] as number;
    return higherIsBetter ? (vb ?? 0) - (va ?? 0) : (va ?? 0) - (vb ?? 0);
  });
}
