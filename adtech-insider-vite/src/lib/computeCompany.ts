import type { CompanyBase, Company, CompanyMetrics, QuarterId } from "@/types/company";
import { normalizeScores } from "./normalizeScores";

const QUARTERS: QuarterId[] = ["Q1", "Q2", "Q3", "Q4"];
const WEIGHTS = {
  perception: 0.4,
  intensity: 0.25,
  activityNormalized: 0.2,
  consistency: 0.15,
};

function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sqDiffs = values.map((v) => (v - mean) ** 2);
  return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeCompanyMetrics(
  companyBase: CompanyBase,
  allActivityCounts?: number[]
): CompanyMetrics {
  const qs = companyBase.quarters;

  const perceptionValues = qs.map((q) => clamp(q.brandPerception, 0, 100));
  const intensityValues = qs.map((q) => clamp(q.marketingIntensity, 0, 100));

  const perceptionAvg =
    perceptionValues.length > 0
      ? perceptionValues.reduce((a, b) => a + b, 0) / perceptionValues.length
      : 0;
  const intensityAvg =
    intensityValues.length > 0
      ? intensityValues.reduce((a, b) => a + b, 0) / intensityValues.length
      : 0;
  const activityCount = qs.reduce((sum, q) => sum + q.keyActivities.length, 0);

  const peakScore = Math.max(
    ...qs.map((q) => q.keyActivities.length),
    0
  );

  const consistencyRaw = stdDev(perceptionValues);
  const consistency = clamp(100 - consistencyRaw * 2, 0, 100);

  const activityNormalized =
    allActivityCounts && allActivityCounts.length > 1
      ? normalizeScores(allActivityCounts)[
          allActivityCounts.indexOf(activityCount)
        ] ?? 50
      : 50;

  const composite =
    perceptionAvg * WEIGHTS.perception +
    intensityAvg * WEIGHTS.intensity +
    (activityNormalized / 100) * 100 * WEIGHTS.activityNormalized +
    consistency * WEIGHTS.consistency;

  let confidence = 100;
  if (qs.length !== 4) confidence -= 25;
  const hasInvalid = qs.some(
    (q) =>
      !Number.isFinite(q.brandPerception) ||
      !Number.isFinite(q.marketingIntensity) ||
      q.brandPerception < 0 ||
      q.brandPerception > 100 ||
      q.marketingIntensity < 0 ||
      q.marketingIntensity > 100
  );
  if (hasInvalid) confidence -= 30;
  confidence = clamp(confidence, 0, 100);

  return {
    perceptionAvg: Math.round(perceptionAvg * 10) / 10,
    intensityAvg: Math.round(intensityAvg * 10) / 10,
    activityCount,
    peakScore,
    consistency: Math.round(consistency * 10) / 10,
    composite: Math.round(composite * 10) / 10,
    confidence: Math.round(confidence * 10) / 10,
  };
}

export function buildCompanies(companiesBase: CompanyBase[]): Company[] {
  const activityCounts = companiesBase.map((c) =>
    c.quarters.reduce((sum, q) => sum + q.keyActivities.length, 0)
  );

  return companiesBase.map((base) => ({
    ...base,
    metrics: computeCompanyMetrics(base, activityCounts),
  }));
}
