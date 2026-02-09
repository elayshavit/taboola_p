import type { InputCompany } from "@/lib/schema";

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function createMockCompany(seed: number): InputCompany {
  const r = (offset: number) => seededRandom(seed + offset);
  const id = `mock-${seed}`;
  const name = `Mock Company ${seed}`;
  const quarters = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"];

  return {
    id,
    name,
    tagline: `AI-powered advertising platform ${seed}`,
    overview: `Mock company ${seed} overview.`,
    strategy_2025_summary: `2025 strategy for ${name}.`,
    offerings: ["Platform A", "Platform B", "Platform C"],
    quarterly_data: quarters.map((q, i) => ({
      quarter: q,
      main_theme: `Theme Q${i + 1}`,
      brand_perception: "Innovation",
      marketing_intensity_score: Math.round(65 + r(i * 10) * 30),
      perception_score: Math.round(60 + r(i * 10 + 1) * 35),
      key_activities: ["Activity 1", "Activity 2", "Activity 3"],
    })),
  };
}
