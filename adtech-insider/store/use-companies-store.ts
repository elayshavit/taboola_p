import { create } from "zustand";
import type { CanonicalCompanyData } from "@/lib/schema";
import { normalizeCompanies } from "@/lib/normalize";
import { parseInputJson } from "@/lib/schema";
import type { InputCompany } from "@/lib/schema";
import { createMockCompany } from "@/lib/mockCompany";

const STORAGE_KEY = "adtech-companies";
const SCHEMA_VERSION = 1;

const SEED_JSON: InputCompany[] = [
  {
    id: "taboola",
    name: "Taboola",
    tagline: "Powering recommendations for the open web",
    overview: "Taboola is a native advertising and content recommendation platform.",
    strategy_2025_summary: "In 2025 Taboola centered on scaling its Yahoo native partnership.",
    offerings: ["Native advertising", "Yahoo-native inventory", "Contextual targeting"],
    quarterly_data: [
      { quarter: "Q1 2025", main_theme: "Foundation for Yahoo ramp", brand_perception: "Scale", marketing_intensity_score: 70, perception_score: 82, key_activities: ["Yahoo partnership narrative", "Contextual alternative positioning", "Cookie deprecation discussions"] },
      { quarter: "Q2 2025", main_theme: "Execution", brand_perception: "Performance", marketing_intensity_score: 75, perception_score: 86, key_activities: ["Q2 financial results", "Guidance raise", "Yahoo promotion"] },
      { quarter: "Q3 2025", main_theme: "Scale and efficiency", brand_perception: "Resilience", marketing_intensity_score: 80, perception_score: 88, key_activities: ["Q3 results", "FY guidance", "Diversification messaging"] },
      { quarter: "Q4 2025", main_theme: "Premium CTV", brand_perception: "Innovation", marketing_intensity_score: 85, perception_score: 90, key_activities: ["LG Performance Enhancer", "DMEXCO panel", "Cannes Lions"] },
    ],
  },
  {
    id: "teads",
    name: "Teads",
    tagline: "Omnichannel outcomes for the open internet",
    overview: "Teads is an omnichannel advertising platform.",
    strategy_2025_summary: "In 2025 Teads focused on CTV as a core growth pillar.",
    offerings: ["Omnichannel platform", "Video ad formats", "CTV advertising"],
    quarterly_data: [
      { quarter: "Q1 2025", main_theme: "CTV catalyst", brand_perception: "Innovation", marketing_intensity_score: 80, perception_score: 88, key_activities: ["Talks with Teads", "Omnichannel framing", "CTV positioning"] },
      { quarter: "Q2 2025", main_theme: "Cannes thought leadership", brand_perception: "Premium", marketing_intensity_score: 90, perception_score: 92, key_activities: ["Cannes yacht", "Elevated Outcomes", "Premium positioning"] },
      { quarter: "Q3 2025", main_theme: "AI effectiveness", brand_perception: "Effectiveness", marketing_intensity_score: 78, perception_score: 89, key_activities: ["Predictive AI", "Thought leadership", "Regional events"] },
      { quarter: "Q4 2025", main_theme: "CTV Performance", brand_perception: "Accountability", marketing_intensity_score: 92, perception_score: 93, key_activities: ["CTV Performance beta", "Men's Wearhouse case", "Universal Pixel"] },
    ],
  },
  {
    id: "the-trade-desk",
    name: "The Trade Desk",
    tagline: "An objectively better way to advertise on the open internet",
    overview: "The Trade Desk is a global demand-side platform.",
    strategy_2025_summary: "In 2025 TTD deepened CTV and live sports leadership.",
    offerings: ["DSP", "Kokai AI", "CTV programmatic"],
    quarterly_data: [
      { quarter: "Q1 2025", main_theme: "CES and CTV", brand_perception: "Leadership", marketing_intensity_score: 95, perception_score: 93, key_activities: ["CES C Space", "Disney cert", "CES campaigns"] },
      { quarter: "Q2 2025", main_theme: "Retail media", brand_perception: "Scale", marketing_intensity_score: 82, perception_score: 88, key_activities: ["Cannes retail", "Omnichannel discussions", "UID 2.0"] },
      { quarter: "Q3 2025", main_theme: "Kokai", brand_perception: "Innovation", marketing_intensity_score: 80, perception_score: 90, key_activities: ["Kokai education", "Media checklist", "Customer materials"] },
      { quarter: "Q4 2025", main_theme: "Open internet", brand_perception: "Trust", marketing_intensity_score: 78, perception_score: 92, key_activities: ["Executive commentary", "2026 positioning", "Thought leadership"] },
    ],
  },
  {
    id: "simpli-fi",
    name: "Simpli.fi",
    tagline: "Advertising success powered by AI and unstructured data",
    overview: "Simpli.fi is an advertising success platform.",
    strategy_2025_summary: "In 2025 Simpli.fi focused on Autopilot AI and Media Planner.",
    offerings: ["Autopilot AI", "Media Planner", "Programmatic CTV"],
    quarterly_data: [
      { quarter: "Q1 2025", main_theme: "AI launch", brand_perception: "Innovation", marketing_intensity_score: 90, perception_score: 89, key_activities: ["Autopilot launch", "CES demos", "Accessibility"] },
      { quarter: "Q2 2025", main_theme: "Omnichannel AI", brand_perception: "Ease", marketing_intensity_score: 78, perception_score: 87, key_activities: ["Search/social integration", "CTV linear", "Case examples"] },
      { quarter: "Q3 2025", main_theme: "Streaming TV", brand_perception: "Growth", marketing_intensity_score: 82, perception_score: 88, key_activities: ["Streaming trends", "ZTV promotion", "Budget education"] },
      { quarter: "Q4 2025", main_theme: "Scaling AI", brand_perception: "Performance", marketing_intensity_score: 80, perception_score: 89, key_activities: ["Autopilot marketing", "Creative optimization", "Streaming measurement"] },
    ],
  },
];

const EXCLUDED_IDS = ["outbrain", "criteo"];

function loadFromStorage(): CanonicalCompanyData[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { version: number; companies: unknown };
    if (parsed.version !== SCHEMA_VERSION || !Array.isArray(parsed.companies)) return null;
    const result = parseInputJson(parsed.companies);
    if (!result.success) return null;
    const normalized = normalizeCompanies(result.data);
    const filtered = normalized.filter((c) => !EXCLUDED_IDS.includes((c.id ?? c.slug ?? "").toLowerCase()));
    if (filtered.length !== normalized.length) {
      saveToStorage(filtered);
    }
    return filtered.length > 0 ? filtered : null;
  } catch {
    return null;
  }
}

function saveToStorage(companies: CanonicalCompanyData[]) {
  if (typeof window === "undefined") return;
  try {
    const toStore = companies.map((c) => ({
      id: c.id,
      name: c.companyName,
      tagline: c.tagline,
      overview: c.overview,
      strategy_2025_summary: c.strategy2025,
      offerings: c.offerings,
      quarterly_data: c.quarterlyData.map((q) => ({
        quarter: q.quarter === "Q1" ? "Q1 2025" : q.quarter === "Q2" ? "Q2 2025" : q.quarter === "Q3" ? "Q3 2025" : "Q4 2025",
        main_theme: q.marketingFocus,
        brand_perception: q.brandPerception,
        marketing_intensity_score: q.intensityScore,
        perception_score: q.perceptionScore,
        key_activities: q.events,
      })),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, companies: toStore }));
  } catch {
    /* ignore */
  }
}

const SEED_CANONICAL = normalizeCompanies(SEED_JSON);

interface CompaniesState {
  companies: CanonicalCompanyData[];
  hydrate: () => void;
  addCompanies: (input: unknown) => { success: true } | { success: false; error: string };
  addMockCompany: (seed: number) => void;
  exportCompaniesJson: () => string;
  resetToSeed: () => void;
}

export const useCompaniesStore = create<CompaniesState>((set, get) => ({
  companies: SEED_CANONICAL,

  hydrate: () => {
    try {
      const stored = loadFromStorage();
      if (stored && Array.isArray(stored) && stored.length > 0) {
        set({ companies: stored });
      }
    } catch {
      // Keep seed data on any load error
    }
  },

  addCompanies: (input: unknown) => {
    const parsed = parseInputJson(input);
    if (!parsed.success) return { success: false, error: parsed.error };
    const filtered = parsed.data.filter((c) => !EXCLUDED_IDS.includes((c.id ?? "").toLowerCase()));
    if (filtered.length === 0) return { success: false, error: "This company cannot be added." };
    const normalized = normalizeCompanies(filtered);
    if (normalized.length === 0) return { success: false, error: "No valid companies after normalization." };
    const existing = get().companies;
    const existingIds = new Set(existing.map((c) => c.id));
    const toAdd = normalized.filter((c) => !existingIds.has(c.id));
    if (toAdd.length === 0) return { success: false, error: "All companies already exist." };
    const next = [...existing, ...toAdd];
    set({ companies: next });
    saveToStorage(next);
    return { success: true };
  },

  addMockCompany: (seed: number) => {
    const mock = createMockCompany(seed);
    const result = get().addCompanies([mock]);
    if (!result.success) {
      const normalized = normalizeCompanies([mock]);
      const next = [...get().companies, ...normalized];
      set({ companies: next });
      saveToStorage(next);
    }
  },

  exportCompaniesJson: () => {
    const companies = get().companies;
    const toExport = companies.map((c) => ({
      id: c.id,
      name: c.companyName,
      tagline: c.tagline,
      overview: c.overview,
      strategy_2025_summary: c.strategy2025,
      offerings: c.offerings,
      quarterly_data: c.quarterlyData.map((q) => ({
        quarter: q.quarter === "Q1" ? "Q1 2025" : q.quarter === "Q2" ? "Q2 2025" : q.quarter === "Q3" ? "Q3 2025" : "Q4 2025",
        main_theme: q.marketingFocus,
        brand_perception: q.brandPerception,
        marketing_intensity_score: q.intensityScore,
        perception_score: q.perceptionScore,
        key_activities: q.events,
      })),
    }));
    return JSON.stringify({ companies: toExport }, null, 2);
  },

  resetToSeed: () => {
    set({ companies: SEED_CANONICAL });
    saveToStorage(SEED_CANONICAL);
  },
}));
