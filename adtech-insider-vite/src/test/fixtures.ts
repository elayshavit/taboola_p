import type { Company, CompanyBase } from "@/types/company";
import { buildCompanies } from "@/lib/computeCompany";

export const fixtureCompanyBase: CompanyBase = {
  id: "fixture-1",
  name: "Fixture Company",
  tagline: "Test tagline",
  overview: "Overview",
  strategy2025Summary: "Strategy",
  offerings: ["A", "B"],
  quarters: [
    { id: "Q1", theme: "Theme 1", brandPerception: 80, marketingIntensity: 70, keyActivities: ["a1", "a2", "a3"], peak: false },
    { id: "Q2", theme: "Theme 2", brandPerception: 85, marketingIntensity: 75, keyActivities: ["b1", "b2", "b3"], peak: true },
    { id: "Q3", theme: "Theme 3", brandPerception: 82, marketingIntensity: 78, keyActivities: ["c1", "c2", "c3"], peak: false },
    { id: "Q4", theme: "Theme 4", brandPerception: 88, marketingIntensity: 80, keyActivities: ["d1", "d2", "d3"], peak: false },
  ],
  channelMix: { events: 5, pressReleases: 3, content: 4, social: 6 },
};

export const fixtureCompanies: Company[] = buildCompanies([fixtureCompanyBase]);
