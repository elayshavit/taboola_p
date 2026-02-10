import { create } from "zustand";
import type { CanonicalCompanyData } from "@/lib/schema";
import { normalizeCompanies } from "@/lib/normalize";
import { createMockCompany } from "@/lib/mockCompany";
import { rawCompaniesJson } from "@/data/data";

const STORAGE_KEY = "adtech-companies";
const SCHEMA_VERSION = 1;

const SEED_JSON = rawCompaniesJson;

const EXCLUDED_IDS = ["outbrain", "criteo"];

function loadFromStorage(): CanonicalCompanyData[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { version: number; companies: unknown };
    if (parsed.version !== SCHEMA_VERSION || !Array.isArray(parsed.companies)) return null;
    const normalized = normalizeCompanies(parsed.companies);
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
      logo: c.logo,
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
  removeCompany: (slugOrId: string) => boolean;
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
    const normalized = normalizeCompanies(input);
    if (normalized.length === 0) return { success: false, error: "No valid companies after normalization." };
    const filtered = normalized.filter((c) => !EXCLUDED_IDS.includes((c.id ?? "").toLowerCase()));
    if (filtered.length === 0) return { success: false, error: "This company cannot be added." };
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

  removeCompany: (slugOrId: string) => {
    const id = slugOrId.toLowerCase().trim();
    const existing = get().companies;
    const next = existing.filter((c) => c.id.toLowerCase() !== id && c.slug.toLowerCase() !== id);
    if (next.length === existing.length) return false;
    set({ companies: next });
    saveToStorage(next);
    return true;
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
