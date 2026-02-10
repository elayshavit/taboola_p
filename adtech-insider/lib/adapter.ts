import type { CanonicalCompanyData } from "@/lib/schema";
import type { CompanyData } from "@/types";
import { isValidLogoUrl } from "@/lib/analyze-adapter";

const QUARTER_DISPLAY: Record<string, string> = {
  Q1: "Q1 2025",
  Q2: "Q2 2025",
  Q3: "Q3 2025",
  Q4: "Q4 2025",
};

/**
 * Convert canonical company data to app-facing CompanyData for UI components.
 */
export function canonicalToCompanyData(
  c: CanonicalCompanyData
): CompanyData {
  const logoUrl = isValidLogoUrl(c.logo);

  return {
    id: c.slug,
    name: c.companyName,
    logoUrl,
    tagline: c.tagline,
    overview: c.overview,
    strategy_2025_summary: c.strategy2025,
    offerings: c.offerings,
    quarterly_data: c.quarterlyData.map((q) => ({
      quarter: QUARTER_DISPLAY[q.quarter] ?? q.quarter,
      main_theme: q.marketingFocus,
      brand_perception: q.brandPerception,
      marketing_intensity_score: q.intensityScore,
      perception_score: q.perceptionScore,
      key_activities: [...q.events],
    })),
  };
}
