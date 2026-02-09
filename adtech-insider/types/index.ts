export type CompanySlug = "taboola" | "teads" | "the-trade-desk" | "simpli-fi" | "criteo";

export interface QuarterlyData {
  quarter: string;
  main_theme: string;
  brand_perception: string;
  marketing_intensity_score: number;
  perception_score: number;
  key_activities: string[];
}

export interface CompanyData {
  id: string;
  name: string;
  tagline: string;
  overview: string;
  strategy_2025_summary: string;
  offerings: string[];
  quarterly_data: QuarterlyData[];
}
