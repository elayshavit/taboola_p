import { create } from "zustand";
import type { CompanyBase, Company } from "@/types/company";
import { companiesBase as seedBase } from "@/data/companies";
import { buildCompanies } from "@/lib/computeCompany";
import { createMockCompany } from "@/lib/mockCompany";
import { parseCompanyJson } from "@/lib/parseCompanyJson";

const STORAGE_KEY = "adtech-companies";
const SEED_IDS = new Set(seedBase.map((c) => c.id));

interface CompaniesState {
  companiesBase: CompanyBase[];
  companies: Company[];
  isHydrated: boolean;
  hydrate: () => void;
  addMockCompany: (seed: number) => void;
  addCompany: (
    base: CompanyBase,
    options?: { logoDataUrl?: string }
  ) => void;
  addCompaniesFromJson: (json: unknown) => { success: true } | { success: false; error: string };
  removeCompany: (id: string) => boolean;
  resetImported: () => void;
  refreshCompanies: () => void;
}

const EXCLUDED_IDS = ["outbrain", "criteo"];

function loadFromStorage(): CompanyBase[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CompanyBase[];
    if (!Array.isArray(parsed)) return null;
    const filtered = parsed.filter((c) => !EXCLUDED_IDS.includes((c.id ?? "").toLowerCase()));
    if (filtered.length !== parsed.length) {
      saveToStorage(filtered);
    }
    return filtered.length > 0 ? filtered : null;
  } catch {
    return null;
  }
}

function saveToStorage(base: CompanyBase[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(base));
  } catch {
    /* ignore */
  }
}

function mergeWithSeed(imported: CompanyBase[]): CompanyBase[] {
  const byId = new Map<string, CompanyBase>();
  for (const c of seedBase) {
    byId.set(c.id, { ...c, source: "seed" });
  }
  for (const c of imported) {
    if (EXCLUDED_IDS.includes((c.id ?? "").toLowerCase())) continue;
    if (!SEED_IDS.has(c.id)) {
      byId.set(c.id, { ...c, source: "imported" });
    }
  }
  return Array.from(byId.values());
}

function buildFromBase(base: CompanyBase[]): Company[] {
  return buildCompanies(base);
}

export const useCompaniesStore = create<CompaniesState>((set, get) => ({
  companiesBase: seedBase.map((c) => ({ ...c, source: "seed" as const })),
  companies: buildFromBase(seedBase),
  isHydrated: false,

  hydrate: () => {
    const stored = loadFromStorage();
    if (stored && stored.length > 0) {
      const merged = mergeWithSeed(stored);
      set({
        companiesBase: merged,
        companies: buildFromBase(merged),
        isHydrated: true,
      });
    } else {
      set({
        companiesBase: seedBase.map((c) => ({ ...c, source: "seed" as const })),
        companies: buildFromBase(seedBase),
        isHydrated: true,
      });
    }
  },

  addMockCompany: (seed: number) => {
    set((state) => {
      const mock = createMockCompany(seed) as CompanyBase & { source?: "imported" };
      mock.source = "imported";
      const next = [...state.companiesBase, mock];
      saveToStorage(next);
      return {
        companiesBase: next,
        companies: buildFromBase(next),
      };
    });
  },

  addCompany: (base, options) => {
    if (EXCLUDED_IDS.includes((base.id ?? "").toLowerCase())) return;
    set((state) => {
      const existing = state.companiesBase.find((c) => c.id === base.id);
      const next = existing
        ? state.companiesBase.map((c) =>
            c.id === base.id
              ? { ...base, source: "imported" as const, logoDataUrl: options?.logoDataUrl ?? c.logoDataUrl }
              : c
          )
        : [...state.companiesBase, { ...base, source: "imported" as const, logoDataUrl: options?.logoDataUrl }];
      saveToStorage(next);
      return {
        companiesBase: next,
        companies: buildFromBase(next),
      };
    });
  },

  addCompaniesFromJson: (json) => {
    const result = parseCompanyJson(json);
    if (!result.success) return { success: false, error: result.error };
    get().addCompany(result.data);
    return { success: true };
  },

  removeCompany: (id: string) => {
    let removed = false;
    set((state) => {
      const next = state.companiesBase.filter((c) => c.id !== id);
      if (next.length < state.companiesBase.length) {
        removed = true;
        saveToStorage(next);
        return {
          companiesBase: next,
          companies: buildFromBase(next),
        };
      }
      return state;
    });
    return removed;
  },

  resetImported: () => {
    set((state) => {
      const next = state.companiesBase.filter((c) => c.source === "seed" || SEED_IDS.has(c.id));
      saveToStorage(next);
      return {
        companiesBase: next,
        companies: buildFromBase(next),
      };
    });
  },

  refreshCompanies: () => {
    set((state) => ({
      companies: buildFromBase(state.companiesBase),
    }));
  },
}));
