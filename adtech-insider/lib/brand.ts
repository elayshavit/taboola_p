import type { BrandPerceptionLabel } from "@/lib/schema";

/**
 * Maps input brand_perception strings to app's BrandPerceptionLabel union.
 * Unknown values default to "Other".
 */
const INPUT_TO_BRAND_PERCEPTION: Record<string, BrandPerceptionLabel> = {
  Scale: "Scale",
  Performance: "Performance",
  Resilience: "Resilience",
  Innovation: "Innovation",
  Premium: "Premium",
  Trust: "Trust",
  Ease: "Ease",
  Growth: "Growth",
  Leadership: "Leadership",
  Accountability: "Accountability",
  Effectiveness: "Effectiveness",
};

export function mapToBrandPerception(input: string): BrandPerceptionLabel {
  const trimmed = input.trim();
  return INPUT_TO_BRAND_PERCEPTION[trimmed] ?? "Other";
}
