import type { InputCompany, InputQuarterlyData } from "@/lib/schema";
import type { CanonicalCompanyData, CanonicalQuarterlyData } from "@/lib/schema";
import { parseInputJsonWithFallback, parseCanonicalCompanies } from "@/lib/schema";
import { mapToBrandPerception } from "@/lib/brand";
import { isValidLogoUrl } from "@/lib/analyze-adapter";
import { sanitizeRawCompanies } from "@/lib/company-sanitizer";

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
    logo: isValidLogoUrl(input.logo) ?? undefined,
  };
}

function extractCompaniesArrayForParse(input: unknown): unknown[] {
  if (Array.isArray(input)) return input;
  if (input && typeof input === "object" && "companies" in input) {
    const arr = (input as { companies?: unknown }).companies;
    return Array.isArray(arr) ? arr : [];
  }
  if (input && typeof input === "object" && "name" in input) return [input];
  return [];
}

/**
 * Normalize input JSON to canonical company data.
 * Uses per-item fallback: when full validation fails, keeps valid items and drops invalid.
 * Sanitizes raw arrays before validation to coerce malformed fields.
 */
export function normalizeCompanies(inputJson: unknown): CanonicalCompanyData[] {
  const start = Date.now();
  const rawArr = extractCompaniesArrayForParse(inputJson);
  const sanitized = rawArr.length > 0 ? sanitizeRawCompanies(rawArr) : [];
  const toParse = sanitized.length > 0 ? sanitized : inputJson;

  const parsed = parseInputJsonWithFallback(toParse);
  if (!parsed.success) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[normalize] Input validation failed:", parsed.error);
    }
    return [];
  }

  const canonical = parsed.data.map(normalizeCompany);
  const validated = parseCanonicalCompanies(canonical);
  if (!validated.success) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[normalize] Canonical validation failed:", validated.error);
    }
    return canonical;
  }
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(
      `[perf] normalize ${canonical.length} companies in ${Date.now() - start}ms`
    );
  }
  return validated.data;
}
