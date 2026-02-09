import { z } from "zod";
import type { CompanyBase, QuarterId } from "@/types/company";

const QuarterIdSchema = z.enum(["Q1", "Q2", "Q3", "Q4"]);

/** Supports camelCase (quarters, brandPerception) and snake_case (quarterly_data, perception_score) */
const InputQuarterSchema = z
  .object({
    id: z.union([QuarterIdSchema, z.string()]).optional(),
    quarter: z.string().optional(),
    theme: z.string().optional(),
    main_theme: z.string().optional(),
    brandPerception: z.number().min(0).max(100).optional(),
    perception_score: z.number().min(0).max(100).optional(),
    marketingIntensity: z.number().min(0).max(100).optional(),
    marketing_intensity_score: z.number().min(0).max(100).optional(),
    keyActivities: z.array(z.string()).optional(),
    key_activities: z.array(z.string()).optional(),
    peak: z.boolean().optional(),
  })
  .transform((raw) => {
    const qMatch = (raw.quarter ?? raw.id ?? "Q1").toString().match(/Q([1-4])/i);
    const id = (qMatch ? `Q${qMatch[1]}` : "Q1") as QuarterId;
    const theme = raw.theme ?? raw.main_theme ?? "";
    const brandPerception = raw.brandPerception ?? raw.perception_score ?? 0;
    const marketingIntensity = raw.marketingIntensity ?? raw.marketing_intensity_score ?? 0;
    const keyActivities = raw.keyActivities ?? raw.key_activities ?? [];
    return {
      id,
      theme,
      brandPerception: Math.max(0, Math.min(100, brandPerception)),
      marketingIntensity: Math.max(0, Math.min(100, marketingIntensity)),
      keyActivities,
      peak: raw.peak ?? false,
    };
  });

const InputChannelMixSchema = z.object({
  events: z.number().optional().default(0),
  pressReleases: z.number().optional().default(0),
  content: z.number().optional().default(0),
  social: z.number().optional().default(0),
});

/** Input schema - explicitly ignores logo/logoSrc/logoUrl/logo */
const InputCompanySchema = z
  .object({
    id: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    name: z.string().min(1),
    tagline: z.string().optional().default(""),
    overview: z.string().optional().default(""),
    strategy2025Summary: z.string().optional(),
    strategy_2025_summary: z.string().optional(),
    offerings: z.array(z.string()).optional().default([]),
    quarters: z.array(InputQuarterSchema).optional(),
    quarterly_data: z.array(InputQuarterSchema).optional(),
    channelMix: InputChannelMixSchema.optional(),
  })
  .passthrough()
  .transform((raw): CompanyBase => {
    const quartersRaw = raw.quarters ?? raw.quarterly_data ?? [];
    const qs = Array.isArray(quartersRaw) ? quartersRaw : [];
    const parsed = qs.slice(0, 4).map((q) =>
      typeof q === "object" && q !== null
        ? InputQuarterSchema.parse(q)
        : {
            id: "Q1" as QuarterId,
            theme: "",
            brandPerception: 0,
            marketingIntensity: 0,
            keyActivities: [] as string[],
            peak: false,
          }
    );
    const fill: { id: QuarterId; theme: string; brandPerception: number; marketingIntensity: number; keyActivities: string[]; peak: boolean }[] = [];
    for (let i = parsed.length; i < 4; i++) {
      fill.push({
        id: ["Q1", "Q2", "Q3", "Q4"][i] as QuarterId,
        theme: "",
        brandPerception: 0,
        marketingIntensity: 0,
        keyActivities: [],
        peak: false,
      });
    }
    const quarters = [...parsed, ...fill].slice(0, 4);
    const id = (raw.id ?? raw.slug ?? raw.name?.toLowerCase().replace(/\s+/g, "-") ?? "unknown").toString();
    return {
      id: id.replace(/\s+/g, "-"),
      name: raw.name,
      tagline: raw.tagline,
      overview: raw.overview,
      strategy2025Summary: raw.strategy2025Summary ?? raw.strategy_2025_summary ?? "",
      offerings: raw.offerings,
      quarters,
      channelMix: raw.channelMix ?? { events: 0, pressReleases: 0, content: 0, social: 0 },
    };
  });

/** Parse JSON input. Ignores logo fields. Returns CompanyBase or error. */
export function parseCompanyJson(
  input: unknown
): { success: true; data: CompanyBase } | { success: false; error: string } {
  const obj =
    typeof input === "string"
      ? (() => {
          try {
            return JSON.parse(input);
          } catch {
            return null;
          }
        })()
      : input;
  if (!obj || typeof obj !== "object") {
    return { success: false, error: "Invalid JSON or empty input." };
  }
  const target = Array.isArray(obj) ? obj[0] : (obj as { companies?: unknown[] }).companies?.[0] ?? obj;
  const result = InputCompanySchema.safeParse(target);
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }
  const msg = result.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
  return { success: false, error: msg };
}
