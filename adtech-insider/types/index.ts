export type CompanySlug = "taboola" | "teads" | "the-trade-desk" | "simpli-fi" | "criteo";

export interface QuarterlyData {
  quarter: string;
  main_theme: string;
  brand_perception: string;
  marketing_intensity_score: number;
  perception_score: number;
  key_activities: string[];
}

/** Extended fields for static companies (enrichment from existing data only). */
export interface CompanyEnrichment {
  summary_extended?: string;
  highlights_extended?: string[];
  risks_extended?: string[];
  initiatives_extended?: string[];
  faq?: { q: string; a: string }[];
  sources_local?: string[];
}

export interface CompanyData {
  id: string;
  name: string;
  /** Optional official logo URL (remote). Null when no safe logo exists. */
  logoUrl?: string | null;
  tagline: string;
  overview: string;
  strategy_2025_summary: string;
  offerings: string[];
  quarterly_data: QuarterlyData[];
  /** Static-only enrichment (highlights, risks, initiatives, FAQ). */
  enrichment?: CompanyEnrichment;
}
