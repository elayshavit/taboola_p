import type { CompanyBase, QuarterId } from "@/types/company";

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function createMockCompany(seed: number): CompanyBase {
  const r = (offset: number) => seededRandom(seed + offset);
  const id = `mock-${seed}`;
  const name = `Mock Company ${seed}`;
  const quarters: QuarterId[] = ["Q1", "Q2", "Q3", "Q4"];

  return {
    id,
    name,
    tagline: `AI-powered advertising platform ${seed}`,
    overview: `Mock company ${seed} overview for testing.`,
    strategy2025Summary: `2025 strategy for ${name}.`,
    offerings: ["Platform A", "Platform B", "Platform C"],
    quarters: quarters.map((id, i) => {
      const base = 60 + r(i * 10) * 35;
      return {
        id,
        theme: `Theme Q${i + 1}`,
        brandPerception: Math.round(base),
        marketingIntensity: Math.round(65 + r(i * 10 + 1) * 30),
        keyActivities: ["Activity 1", "Activity 2", "Activity 3"],
        peak: i === 3,
      };
    }),
    channelMix: {
      events: Math.round(8 + r(100) * 10),
      pressReleases: Math.round(5 + r(101) * 8),
      content: Math.round(10 + r(102) * 12),
      social: Math.round(6 + r(103) * 10),
    },
  };
}
