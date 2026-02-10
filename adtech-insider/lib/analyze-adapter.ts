import { z } from "zod";
import type { CompanyData, QuarterlyData } from "@/types";

/**
 * Zod schema for the raw LLM response. This mirrors the JSON schema
 * defined in the system prompt for /api/analyze.
 */
export const AnalyzeLLMResponseSchema = z.object({
  company: z.object({
    name: z.string(),
    slug: z.string(),
    sector: z.string().nullable(),
    geo: z.string().nullable(),
    // Optional logo URL proposed by the model; will be sanitized later.
    logoUrl: z.string().nullable().optional(),
  }),
  year: z.number(),
  summary: z.string(),
  highlights: z.array(z.string()),
  risks: z.array(z.string()),
  initiatives: z.array(z.string()),
  quarters: z.array(
    z.object({
      quarter: z.enum(["Q1", "Q2", "Q3", "Q4"]),
      theme: z.string(),
      activities: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          channel: z.string(),
          kpi: z.string(),
          notes: z.string().optional().nullable(),
          confidence: z.number(),
        })
      ),
      scores: z.object({
        activity: z.number(),
        intensity: z.number(),
        peak: z.number(),
        perception: z.number(),
      }),
    })
  ),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string().nullable(),
      type: z.string(),
    })
  ),
  confidence_overall: z.number(),
});

export type AnalyzeApiResponse = z.infer<typeof AnalyzeLLMResponseSchema>;

type AnalyzeQuarter = AnalyzeApiResponse["quarters"][number];
type AnalyzeActivity = AnalyzeQuarter["activities"][number];
type AnalyzeScores = AnalyzeQuarter["scores"];

const DEFAULT_YEAR = 2025;

const DEFAULT_CONFIDENCE = 0.6;

const DEFAULT_SCORES: AnalyzeScores = {
  activity: 55,
  intensity: 60,
  peak: 50,
  perception: 58,
};

const DEFAULT_ACTIVITIES: AnalyzeActivity[] = [
  {
    title: "Planned AI optimization",
    description: "Deploy ML-based bidding and creative iteration across key campaigns.",
    channel: "Programmatic",
    kpi: "ROAS",
    notes: undefined,
    confidence: DEFAULT_CONFIDENCE,
  },
  {
    title: "CTV partnerships",
    description: "Expand audience reach via CTV publishers and measure incremental brand lift.",
    channel: "CTV",
    kpi: "Brand lift",
    notes: undefined,
    confidence: DEFAULT_CONFIDENCE,
  },
  {
    title: "First-party data onboarding",
    description: "Activate CRM and first-party audiences with privacy-safe matching.",
    channel: "Retail Media",
    kpi: "Reach",
    notes: undefined,
    confidence: DEFAULT_CONFIDENCE,
  },
];

const PERCEPTION_WORDS: Record<string, number> = {
  Innovation: 88,
  Scale: 85,
  Performance: 86,
  Trust: 90,
  Premium: 87,
  Resilience: 82,
  Leadership: 92,
  Ease: 78,
  Growth: 84,
  Accountability: 80,
  Effectiveness: 85,
  Other: 75,
};

/**
 * Validate that a URL is a plausible, safe, official logo reference.
 * Rules:
 * - non-empty string
 * - HTTPS only
 * - ends with .svg, .png, .jpg, or .webp
 * - must parse as a valid URL
 * - reject obvious placeholders (e.g. "placeholder", "default-logo", "logo.png")
 */
export function isValidLogoUrl(
  url: string | null | undefined
): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith("https://")) return null;

  const lower = trimmed.toLowerCase();
  const allowedExts = [".svg", ".png", ".jpg", ".webp"];
  if (!allowedExts.some((ext) => lower.endsWith(ext))) return null;

  // Basic hallucination / placeholder protection
  if (
    lower.includes("placeholder") ||
    lower.includes("default-logo") ||
    lower.endsWith("/logo.png") ||
    lower.endsWith("logo.png")
  ) {
    return null;
  }

  try {
    // eslint-disable-next-line no-new
    new URL(trimmed);
  } catch {
    return null;
  }

  return trimmed;
}

function toCompanyDisplayNameFromSlug(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function clamp01(value: number | undefined, fallback = DEFAULT_CONFIDENCE): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function clampScore(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  const rounded = Math.round(value);
  if (rounded < 0) return 0;
  if (rounded > 100) return 100;
  return rounded;
}

function ensureNonEmptyStringArray(
  input: unknown,
  fallback: string[]
): string[] {
  if (Array.isArray(input)) {
    const cleaned = input
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter((v) => v.length > 0);
    if (cleaned.length > 0) return cleaned;
  }
  return fallback;
}

function ensureActivities(activities: AnalyzeActivity[] | undefined): AnalyzeActivity[] {
  const base: AnalyzeActivity[] = Array.isArray(activities)
    ? activities.map((a) => ({
        title: (a?.title || "").trim() || "Planned marketing initiative",
        description:
          (a?.description || "").trim() ||
          "Execute a relevant marketing or growth initiative aligned with the quarterly theme.",
        channel: (a?.channel || "").trim() || "Programmatic",
        kpi: (a?.kpi || "").trim() || "ROAS",
        notes: a?.notes ?? undefined,
        confidence: clamp01(a?.confidence),
      }))
    : [];

  while (base.length < 3) {
    base.push(DEFAULT_ACTIVITIES[base.length % DEFAULT_ACTIVITIES.length]);
  }

  return base;
}

function normalizeScores(scores: AnalyzeScores | undefined): AnalyzeScores {
  const src = scores ?? DEFAULT_SCORES;
  return {
    activity: clampScore(src.activity, DEFAULT_SCORES.activity),
    intensity: clampScore(src.intensity, DEFAULT_SCORES.intensity),
    peak: clampScore(src.peak, DEFAULT_SCORES.peak),
    perception: clampScore(src.perception, DEFAULT_SCORES.perception),
  };
}

function scoreToPerceptionLabel(score: number): string {
  if (score >= 90) return "Leadership";
  if (score >= 85) return "Innovation";
  if (score >= 80) return "Performance";
  if (score >= 75) return "Scale";
  if (score >= 70) return "Effectiveness";
  if (score >= 65) return "Resilience";
  return "Other";
}

const QUARTER_ORDER: Array<"Q1" | "Q2" | "Q3" | "Q4"> = ["Q1", "Q2", "Q3", "Q4"];

export function buildFallbackAnalyzeResponse(
  companyName: string,
  year: number = DEFAULT_YEAR
): AnalyzeApiResponse {
  const slug = companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-]+|[-]+$/g, "") || "unknown-company";

  const summary = `High-level view of ${companyName}'s marketing and growth activities for ${year}, including always-on performance programs and brand initiatives.`;

  const baseQuarter = (quarter: "Q1" | "Q2" | "Q3" | "Q4"): AnalyzeQuarter => ({
    quarter,
    theme: "General marketing activities",
    activities: DEFAULT_ACTIVITIES,
    scores: DEFAULT_SCORES,
  });

  return {
    company: {
      name: companyName,
      slug,
      sector: null,
      geo: null,
      logoUrl: null,
    },
    year,
    summary,
    highlights: [
      "Consistent investment in performance and brand marketing channels.",
      "Ongoing experimentation with AI-driven optimization and new inventory.",
      "Focus on privacy-safe, first-party data activation across regions.",
    ],
    risks: [
      "Macroeconomic uncertainty and evolving privacy regulation.",
      "Dependence on a small number of major traffic or demand sources.",
    ],
    initiatives: [
      "Scale AI-driven bidding and creative optimization across key markets.",
      "Deepen partnerships across CTV, retail media, and commerce environments.",
    ],
    quarters: QUARTER_ORDER.map((q) => baseQuarter(q)),
    sources: [
      {
        title: "Generic/industry reference or internal reasoning",
        url: null,
        type: "model",
      },
    ],
    confidence_overall: DEFAULT_CONFIDENCE,
  };
}

/**
 * Sanitize and fully-populate the raw LLM response so that it always
 * adheres to the JSON contract: non-empty strings, 4 quarters,
 * >=3 activities per quarter, and scores/clamped confidences.
 */
export function sanitizeAnalyzeApiResponse(
  raw: unknown,
  companyName: string,
  year: number = DEFAULT_YEAR
): AnalyzeApiResponse {
  const fallbackBase = buildFallbackAnalyzeResponse(companyName, year);
  const parsed = AnalyzeLLMResponseSchema.safeParse(raw);

  if (!parsed.success && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.warn("[analyze-adapter] LLM response validation failed, using fallback:", {
      issues: parsed.error.issues.slice(0, 3).map((i) => i.path.join(".") + ": " + i.message),
    });
  }

  const base: AnalyzeApiResponse = parsed.success ? parsed.data : fallbackBase;

  const companyObj = base?.company ?? fallbackBase.company;
  const safeCompanyName =
    (companyObj?.name && String(companyObj.name).trim()) || companyName;

  const slug =
    (companyObj?.slug && String(companyObj.slug).trim()) ||
    safeCompanyName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[-]+|[-]+$/g, "") ||
    "unknown-company";

  const highlights = ensureNonEmptyStringArray(base.highlights, [
    "Active presence across key marketing channels.",
  ]);

  const risks = ensureNonEmptyStringArray(base.risks, [
    "Execution risk around scaling new initiatives.",
  ]);

  const initiatives = ensureNonEmptyStringArray(base.initiatives, [
    "Maintain strong performance marketing while testing new growth channels.",
  ]);

  const yearValue =
    typeof base.year === "number" && base.year > 1900 ? base.year : year;

  const quartersMap: Record<string, AnalyzeQuarter> = {};
  for (const q of base.quarters ?? []) {
    if (!q || !q.quarter) continue;
    quartersMap[q.quarter] = q;
  }

  const safeQuarters: AnalyzeQuarter[] = QUARTER_ORDER.map((q) => {
    const existing = quartersMap[q];
    const theme =
      (existing?.theme && existing.theme.trim()) || "General marketing activities";
    const activities = ensureActivities(existing?.activities);
    const scores = normalizeScores(existing?.scores);

    return {
      quarter: q,
      theme,
      activities,
      scores,
    };
  });

  const sources =
    Array.isArray(base.sources) && base.sources.length > 0
      ? base.sources
      : [
          {
            title: "Generic/industry reference or internal reasoning",
            url: null,
            type: "model",
          },
        ];

  const confidence_overall = clamp01(base.confidence_overall);

  return {
    company: {
      name: safeCompanyName,
      slug,
      sector: companyObj?.sector ?? null,
      geo: companyObj?.geo ?? null,
      logoUrl: isValidLogoUrl(companyObj?.logoUrl),
    },
    year: yearValue,
    summary:
      (base.summary && base.summary.trim()) ||
      `High-level view of ${safeCompanyName}'s marketing and strategic activities for ${yearValue}.`,
    highlights,
    risks,
    initiatives,
    quarters: safeQuarters,
    sources,
    confidence_overall,
  };
}

export function analyzeResponseToCompanyData(
  slug: string,
  res: AnalyzeApiResponse
): CompanyData {
  const displayNameFromSlug = toCompanyDisplayNameFromSlug(slug);
  const safe = sanitizeAnalyzeApiResponse(res, displayNameFromSlug, DEFAULT_YEAR);
  const logoUrl = isValidLogoUrl(safe.company.logoUrl);

  const quarters: QuarterlyData[] = QUARTER_ORDER.map((qCode) => {
    const q = safe.quarters.find((item) => item.quarter === qCode);
    const scores = normalizeScores(q?.scores);
    const perceptionLabel = scoreToPerceptionLabel(scores.perception);

    const activities = ensureActivities(q?.activities);

    return {
      quarter: `${qCode} ${safe.year}`,
      main_theme: q?.theme || "General marketing activities",
      brand_perception: perceptionLabel,
      marketing_intensity_score: scores.intensity,
      perception_score: scores.perception,
      key_activities: activities.map((a) => `${a.title}: ${a.description}`),
    };
  });

  return {
    id: slug,
    name: safe.company.name || slug,
    logoUrl,
    tagline: "",
    overview:
      (safe.summary && safe.summary.trim()) ||
      `Marketing and strategic activities for ${safe.company.name} in ${safe.year}.`,
    strategy_2025_summary:
      ensureNonEmptyStringArray(safe.initiatives, []).join(" · ") ||
      `Scale core performance marketing while testing new growth and brand initiatives in ${safe.year}.`,
    offerings: ensureNonEmptyStringArray(safe.highlights, []),
    quarterly_data: quarters,
  };
}
