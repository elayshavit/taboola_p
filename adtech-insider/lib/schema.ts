import { z } from "zod";

// =============================================================================
// INPUT JSON SCHEMA (from external JSON)
// =============================================================================

/** Supports both snake_case (quarter, main_theme) and camelCase (id, theme, brandPerception) */
function parseQuarterStr(s: string): string {
  const m = s.match(/Q([1-4])/i);
  if (m) return `Q${m[1]} 2025`;
  return "Q1 2025";
}

const InputQuarterlyDataSchema = z.object({
  quarter: z.string().optional(),
  id: z.string().optional(),
  main_theme: z.string().optional(),
  theme: z.string().optional(),
  brand_perception: z.union([z.string(), z.number()]).optional(),
  brandPerception: z.number().optional(),
  marketing_intensity_score: z.number().optional(),
  marketingIntensity: z.number().optional(),
  perception_score: z.number().optional(),
  key_activities: z.array(z.string()).optional(),
  keyActivities: z.array(z.string()).optional(),
  peak: z.boolean().optional(),
}).transform((raw) => ({
  quarter: parseQuarterStr((raw.quarter ?? raw.id ?? "Q1").toString()),
  main_theme: raw.main_theme ?? raw.theme ?? "",
  brand_perception: String(raw.brand_perception ?? raw.brandPerception ?? ""),
  marketing_intensity_score: Number(raw.marketing_intensity_score ?? raw.marketingIntensity ?? 0),
  perception_score: Number(raw.perception_score ?? raw.brandPerception ?? 0),
  key_activities: raw.key_activities ?? raw.keyActivities ?? [],
}));

export type InputQuarterlyData = z.infer<typeof InputQuarterlyDataSchema>;

export const InputCompanySchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  name: z.string(),
  tagline: z.string().optional(),
  overview: z.string().optional(),
  strategy_2025_summary: z.string().optional(),
  strategy2025Summary: z.string().optional(),
  offerings: z.array(z.string()).optional(),
  quarterly_data: z.array(InputQuarterlyDataSchema).optional(),
  quarters: z.array(z.any()).optional(),
  logo: z.union([z.string(), z.null()]).optional(),
}).transform((raw) => {
  const qData = raw.quarterly_data ?? raw.quarters ?? [];
  const mapped = Array.isArray(qData) ? qData.map((q: unknown) =>
    typeof q === "object" && q !== null
      ? InputQuarterlyDataSchema.parse(q)
      : { quarter: "Q1 2025", main_theme: "", brand_perception: "", marketing_intensity_score: 0, perception_score: 0, key_activities: [] }
  ) : [];
  const filled = [...mapped];
  for (let i = filled.length; i < 4; i++) {
    filled.push({ quarter: `Q${i + 1} 2025`, main_theme: "", brand_perception: "", marketing_intensity_score: 0, perception_score: 0, key_activities: [] });
  }
  return {
    id: (raw.id ?? raw.slug ?? raw.name?.toLowerCase().replace(/\s+/g, "-") ?? "unknown").replace(/\s+/g, "-"),
    name: raw.name,
    tagline: raw.tagline ?? "",
    overview: raw.overview ?? "",
    strategy_2025_summary: raw.strategy_2025_summary ?? raw.strategy2025Summary ?? "",
    offerings: raw.offerings ?? [],
    quarterly_data: filled.slice(0, 4),
    logo: raw.logo ?? undefined,
  };
});

// Accept either { companies: [...] }, direct array, or single company object
export const InputJsonSchema = z.union([
  z.object({ companies: z.array(InputCompanySchema) }).transform((v) => v.companies),
  z.array(InputCompanySchema),
  InputCompanySchema.transform((c) => [c]),
]);

export type InputCompany = z.infer<typeof InputCompanySchema>;

// =============================================================================
// CANONICAL SCHEMA (app target shape)
// =============================================================================

export const BrandPerceptionLabelSchema = z.enum([
  "Scale",
  "Performance",
  "Resilience",
  "Innovation",
  "Premium",
  "Trust",
  "Ease",
  "Growth",
  "Leadership",
  "Accountability",
  "Effectiveness",
  "Other",
]);

export type BrandPerceptionLabel = z.infer<typeof BrandPerceptionLabelSchema>;

export const CanonicalQuarterSchema = z.enum(["Q1", "Q2", "Q3", "Q4"]);

export const CanonicalQuarterlyDataSchema = z.object({
  quarter: CanonicalQuarterSchema,
  marketingFocus: z.string(),
  brandPerception: BrandPerceptionLabelSchema,
  events: z.array(z.string()),
  reportsPublished: z.array(z.string()),
  perceptionScore: z.number().min(0).max(100),
  intensityScore: z.number().min(0).max(100),
});

export const CanonicalCompanyDataSchema = z.object({
  id: z.string(),
  companyName: z.string(),
  slug: z.string(),
  logo: z.string().optional(),
  tagline: z.string(),
  overview: z.string(),
  offerings: z.array(z.string()),
  strategy2025: z.string(),
  quarterlyData: z.array(CanonicalQuarterlyDataSchema).length(4),
});

export type CanonicalQuarterlyData = z.infer<typeof CanonicalQuarterlyDataSchema>;
export type CanonicalCompanyData = z.infer<typeof CanonicalCompanyDataSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export function parseInputJson(
  data: unknown
): { success: true; data: InputCompany[] } | { success: false; error: string } {
  const result = InputJsonSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const issues = result.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
  return {
    success: false,
    error: `Input JSON validation failed: ${issues}`,
  };
}

/**
 * Extract array of companies from unknown input.
 * Handles { companies: [...] }, direct array, or single company.
 */
function extractCompaniesArray(input: unknown): unknown[] {
  if (Array.isArray(input)) return input;
  if (input && typeof input === "object" && "companies" in input) {
    const arr = (input as { companies?: unknown }).companies;
    return Array.isArray(arr) ? arr : [];
  }
  if (input && typeof input === "object" && "name" in input) {
    return [input];
  }
  return [];
}

/**
 * Parse input with per-item fallback: when full schema fails,
 * validate each item individually and return valid ones.
 */
export function parseInputJsonWithFallback(
  data: unknown
): { success: true; data: InputCompany[]; partial: boolean } | { success: false; error: string } {
  const fullResult = InputJsonSchema.safeParse(data);
  if (fullResult.success) {
    return { success: true, data: fullResult.data, partial: false };
  }

  const issues = fullResult.error.issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
    code: i.code,
  }));

  if (process.env.NODE_ENV === "development") {
    const arr = extractCompaniesArray(data);
    // eslint-disable-next-line no-console
    console.error("[normalize] Input validation failed", {
      count: Array.isArray(data) ? data.length : "non-array",
      issues,
      sample: arr.slice(0, 2),
    });
  }

  const arr = extractCompaniesArray(data);
  const safeItems: InputCompany[] = [];

  for (let idx = 0; idx < arr.length; idx++) {
    const item = arr[idx];
    const single = InputCompanySchema.safeParse(item);
    if (single.success) {
      safeItems.push(single.data);
    } else if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn("[normalize] Dropping invalid company at index", idx, {
        issues: single.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
        name: item && typeof item === "object" && "name" in item ? (item as { name?: unknown }).name : "(unknown)",
        slug: item && typeof item === "object" && "slug" in item ? (item as { slug?: unknown }).slug : "(unknown)",
      });
    }
  }

  if (safeItems.length > 0) {
    return { success: true, data: safeItems, partial: true };
  }

  const msg = issues.map((i) => `${i.path}: ${i.message}`).join("; ");
  return { success: false, error: `Input JSON validation failed: ${msg}` };
}

export function parseCanonicalCompanies(
  data: unknown
): { success: true; data: CanonicalCompanyData[] } | { success: false; error: string } {
  const result = z.array(CanonicalCompanyDataSchema).safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const issues = result.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
  return {
    success: false,
    error: `Canonical data validation failed: ${issues}`,
  };
}
