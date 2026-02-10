/**
 * Centralized validation and guard utilities for AdTech Insider.
 * Ensures schema-compliant shapes across static and dynamic data flows.
 */

import type { CompanyData, QuarterlyData } from "@/types";

/** Ensure slug is non-empty, lowercase, hyphenated. */
export function normalizeSlug(input: string | undefined | null): string {
  if (typeof input !== "string" || !input.trim()) return "unknown";
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-]+|[-]+$/g, "") || "unknown";
}

/** Ensure string is non-empty or return fallback. */
export function ensureString(
  value: unknown,
  fallback: string
): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
}

/** Ensure array of strings; filter out non-strings and empties. */
export function ensureStringArray(
  value: unknown,
  fallback: string[] = []
): string[] {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value
    .filter((v): v is string => typeof v === "string")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return cleaned.length > 0 ? cleaned : fallback;
}

/** Ensure quarterly data array has exactly 4 quarters with safe defaults. */
export function ensureQuarterlyData(
  value: unknown
): QuarterlyData[] {
  if (!Array.isArray(value) || value.length === 0) {
    return defaultQuarterlyData();
  }

  const quarters = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"];
  return quarters.map((q, i) => {
    const raw = value[i];
    if (!raw || typeof raw !== "object") {
      return defaultQuarter(q);
    }
    const r = raw as Record<string, unknown>;
    return {
      quarter: ensureString(r.quarter, q),
      main_theme: ensureString(r.main_theme, ""),
      brand_perception: ensureString(r.brand_perception, "Other"),
      marketing_intensity_score: clampScore(
        typeof r.marketing_intensity_score === "number"
          ? r.marketing_intensity_score
          : 0
      ),
      perception_score: clampScore(
        typeof r.perception_score === "number" ? r.perception_score : 0
      ),
      key_activities: ensureStringArray(r.key_activities, []),
    };
  });
}

function clampScore(v: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function defaultQuarter(quarter: string): QuarterlyData {
  return {
    quarter,
    main_theme: "",
    brand_perception: "Other",
    marketing_intensity_score: 50,
    perception_score: 50,
    key_activities: [],
  };
}

function defaultQuarterlyData(): QuarterlyData[] {
  return [
    defaultQuarter("Q1 2025"),
    defaultQuarter("Q2 2025"),
    defaultQuarter("Q3 2025"),
    defaultQuarter("Q4 2025"),
  ];
}

/**
 * Validate and coerce CompanyData to ensure no undefined required fields.
 * Use after adapter/normalize when passing to UI components.
 */
export function validateCompanyData(
  data: Partial<CompanyData> | null | undefined,
  fallbackId: string = "unknown"
): CompanyData | null {
  if (!data || typeof data !== "object") return null;

  const id = normalizeSlug(data.id ?? fallbackId);
  const name = ensureString(data.name, id);

  return {
    id,
    name,
    logoUrl: data.logoUrl ?? undefined,
    tagline: ensureString(data.tagline, ""),
    overview: ensureString(data.overview, ""),
    strategy_2025_summary: ensureString(data.strategy_2025_summary, ""),
    offerings: ensureStringArray(data.offerings, []),
    quarterly_data: ensureQuarterlyData(data.quarterly_data),
    enrichment: data.enrichment,
  };
}
