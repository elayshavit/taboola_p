/**
 * Single source of truth for company metrics across the AdTech Insider app.
 * Used by per-company views, Compare All, and all charts/cards.
 */

export type CompanyMetricsId = "the-trade-desk" | "teads" | "simpli-fi" | "taboola";

export interface CompanyMetrics {
  id: CompanyMetricsId;
  name: string;
  metrics: {
    activity: number;
    intensity: number;
    peak: number;
    perception: number;
    consistency: number;
    composite: number;
  };
}

export const COMPANIES_METRICS: CompanyMetrics[] = [
  {
    id: "the-trade-desk",
    name: "The Trade Desk",
    metrics: {
      activity: 92,
      intensity: 84,
      peak: 55,
      perception: 91,
      consistency: 96,
      composite: 0.9,
    },
  },
  {
    id: "teads",
    name: "Teads",
    metrics: {
      activity: 90,
      intensity: 85,
      peak: 55,
      perception: 91,
      consistency: 96,
      composite: 0.89,
    },
  },
  {
    id: "simpli-fi",
    name: "Simpli.fi",
    metrics: {
      activity: 88,
      intensity: 82,
      peak: 48,
      perception: 88,
      consistency: 98,
      composite: 0.87,
    },
  },
  {
    id: "taboola",
    name: "Taboola",
    metrics: {
      activity: 85,
      intensity: 78,
      peak: 40,
      perception: 87,
      consistency: 94,
      composite: 0.86,
    },
  },
];

const METRICS_BY_ID = new Map<string, CompanyMetrics>(
  COMPANIES_METRICS.map((c) => [c.id, c])
);

export function getCompanyMetrics(id: string): CompanyMetrics["metrics"] | null {
  return METRICS_BY_ID.get(id)?.metrics ?? null;
}
