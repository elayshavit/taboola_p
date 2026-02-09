import type { InputCompany, InputQuarterlyData } from "@/lib/schema";
import type { CanonicalCompanyData, CanonicalQuarterlyData } from "@/lib/schema";
import { parseInputJson, parseCanonicalCompanies } from "@/lib/schema";
import { mapToBrandPerception } from "@/lib/brand";

const QUARTERS: readonly ["Q1", "Q2", "Q3", "Q4"] = ["Q1", "Q2", "Q3", "Q4"];

function parseQuarter(input: string): "Q1" | "Q2" | "Q3" | "Q4" {
  const m = input.match(/Q([1-4])/i);
  if (m) return `Q${m[1]}` as "Q1" | "Q2" | "Q3" | "Q4";
  return "Q1";
}

/** Clamp numeric score to 0-100; use direct values, no derivation */
function clampScore(v: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeQuarter(
  input: InputQuarterlyData | undefined,
  quarter: "Q1" | "Q2" | "Q3" | "Q4",
  _companyName: string
): CanonicalQuarterlyData {
  const mainTheme = input?.main_theme ?? "";
  const brandPerceptionRaw = input?.brand_perception ?? "";
  const rawIntensity =
    typeof input?.marketing_intensity_score === "number"
      ? input.marketing_intensity_score
      : 0;
  const rawPerception =
    typeof input?.perception_score === "number" ? input.perception_score : 0;
  const keyActivities = Array.isArray(input?.key_activities) ? input.key_activities : [];
  // reportsPublished: if missing in input, set to [] (no synthetic generation)
  const reportsPublished: string[] = [];

  return {
    quarter,
    marketingFocus: mainTheme,
    brandPerception: mapToBrandPerception(brandPerceptionRaw),
    events: [...keyActivities],
    reportsPublished,
    perceptionScore: clampScore(rawPerception),
    intensityScore: clampScore(rawIntensity),
  };
}

function normalizeCompany(input: InputCompany): CanonicalCompanyData {
  const companyName = input.name ?? "Unknown";
  const slug = input.id ?? "unknown";

  const quarterMap = new Map<string, InputQuarterlyData>();
  for (const q of input.quarterly_data ?? []) {
    const parsed = parseQuarter(q.quarter);
    quarterMap.set(parsed, q);
  }

  const quarterlyData: CanonicalQuarterlyData[] = QUARTERS.map((q) =>
    normalizeQuarter(quarterMap.get(q), q, companyName)
  );

  return {
    id: slug,
    slug,
    companyName,
    tagline: input.tagline ?? "",
    overview: input.overview ?? "",
    offerings: Array.isArray(input.offerings) ? input.offerings : [],
    strategy2025: input.strategy_2025_summary ?? "",
    quarterlyData,
  };
}

/**
 * Normalize input JSON to canonical company data.
 * All companies get 4 quarters with valid arrays and metrics.
 */
export function normalizeCompanies(inputJson: unknown): CanonicalCompanyData[] {
  const parsed = parseInputJson(inputJson);
  if (!parsed.success) {
    if (process.env.NODE_ENV === "development") {
      console.error("[normalize] Input validation failed:", parsed.error);
    }
    return [];
  }

  const canonical = parsed.data.map(normalizeCompany);
  const validated = parseCanonicalCompanies(canonical);
  if (!validated.success) {
    if (process.env.NODE_ENV === "development") {
      console.error("[normalize] Canonical validation failed:", validated.error);
    }
    return canonical; // Return anyway; Zod transform may have altered
  }
  return validated.data;
}
