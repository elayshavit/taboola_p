import { create } from "zustand";
import type { SortMetric } from "@/lib/compare";

export type ViewMode = "cards" | "table";

export type QuarterOption = "all" | "Q1 2025" | "Q2 2025" | "Q3 2025" | "Q4 2025";

export type MetricKey =
  | "brand"
  | "innovation"
  | "presence"
  | "activity"
  | "peak"
  | "consistency";

export interface MetricWeights {
  brand: number;
  innovation: number;
  presence: number;
  activity: number;
}

export interface SavedView {
  id: string;
  name: string;
  timestamp: number;
  companies: string[];
  quarters: QuarterOption[];
  metrics: MetricKey[];
  normalize: boolean;
  showRanks: boolean;
  weights: MetricWeights;
  viewMode: ViewMode;
  sortMetric: SortMetric;
}

const DEFAULT_WEIGHTS: MetricWeights = {
  brand: 40,
  innovation: 20,
  presence: 20,
  activity: 20,
};

const SCHEMA_VERSION = 1;
const STORAGE_KEY = "adtech-compare-views";

export interface CompareState {
  viewMode: ViewMode;
  selectedCompanies: string[];
  quarterFocus: QuarterOption | QuarterOption[];
  selectedMetrics: MetricKey[];
  normalize: boolean;
  showRanks: boolean;
  weights: MetricWeights;
  sortMetric: SortMetric;
  activeCompanyFilter: string | null;
  hoveredCompany: string | null;
  savedViews: SavedView[];
}

export interface CompareActions {
  setViewMode: (v: ViewMode) => void;
  setSelectedCompanies: (c: string[]) => void;
  setQuarterFocus: (q: QuarterOption | QuarterOption[]) => void;
  setSelectedMetrics: (m: MetricKey[]) => void;
  setNormalize: (v: boolean) => void;
  setShowRanks: (v: boolean) => void;
  setWeights: (w: Partial<MetricWeights>) => void;
  setSortMetric: (m: SortMetric) => void;
  setActiveCompanyFilter: (c: string | null) => void;
  setHoveredCompany: (c: string | null) => void;
  clearFilters: () => void;
  saveView: (name: string) => void;
  loadView: (id: string) => void;
  deleteView: (id: string) => void;
  loadSavedViews: () => void;
}

const SEED_SLUGS = ["taboola", "teads", "the-trade-desk", "simpli-fi"];
const ALL_METRICS: MetricKey[] = ["brand", "innovation", "presence", "activity", "peak", "consistency"];

function loadFromStorage(): SavedView[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { version: number; views: SavedView[] };
    if (parsed.version !== SCHEMA_VERSION) return [];
    return parsed.views ?? [];
  } catch {
    return [];
  }
}

function saveToStorage(views: SavedView[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION, views })
    );
  } catch {
    /* ignore */
  }
}

function normalizeWeights(w: Partial<MetricWeights>): MetricWeights {
  const keys: (keyof MetricWeights)[] = ["brand", "innovation", "presence", "activity"];
  const updated = { ...DEFAULT_WEIGHTS, ...w };
  const sum = keys.reduce((s, k) => s + (updated[k] ?? 0), 0);
  if (sum === 0) return DEFAULT_WEIGHTS;
  const factor = 100 / sum;
  const out: MetricWeights = { ...updated };
  keys.forEach((k) => {
    out[k] = Math.round((out[k] ?? 0) * factor);
  });
  const remainder = 100 - keys.reduce((s, k) => s + out[k], 0);
  if (remainder !== 0) out.brand = Math.max(0, out.brand + remainder);
  return out;
}

export const useCompareStore = create<CompareState & CompareActions>((set, get) => ({
  viewMode: "cards",
  selectedCompanies: [...SEED_SLUGS],
  quarterFocus: "all",
  selectedMetrics: [...ALL_METRICS],
  normalize: true,
  showRanks: true,
  weights: DEFAULT_WEIGHTS,
  sortMetric: "avgBrandScore",
  activeCompanyFilter: null,
  hoveredCompany: null,
  savedViews: [],

  setViewMode: (v) => set({ viewMode: v }),
  setSelectedCompanies: (c) =>
    set({
      selectedCompanies:
        c.length >= 2 && c.length <= 4
          ? c
          : c.length === 1
          ? [c[0], ...SEED_SLUGS.filter((x) => x !== c[0]).slice(0, 3)]
          : get().selectedCompanies,
    }),
  setQuarterFocus: (q) => set({ quarterFocus: q }),
  setSelectedMetrics: (m) =>
    set({
      selectedMetrics: m.length > 0 ? m : get().selectedMetrics,
    }),
  setNormalize: (v) => set({ normalize: v }),
  setShowRanks: (v) => set({ showRanks: v }),
  setWeights: (w) => set({ weights: normalizeWeights({ ...get().weights, ...w }) }),
  setSortMetric: (m) => set({ sortMetric: m }),
  setActiveCompanyFilter: (c) => set({ activeCompanyFilter: c }),
  setHoveredCompany: (c) => set({ hoveredCompany: c }),
  clearFilters: () => set({ activeCompanyFilter: null }),

  saveView: (name) => {
    const s = get();
    const view: SavedView = {
      id: `v-${Date.now()}`,
      name,
      timestamp: Date.now(),
      companies: [...s.selectedCompanies],
      quarters: Array.isArray(s.quarterFocus) ? s.quarterFocus : s.quarterFocus === "all" ? ["all"] : [s.quarterFocus],
      metrics: [...s.selectedMetrics],
      normalize: s.normalize,
      showRanks: s.showRanks,
      weights: { ...s.weights },
      viewMode: s.viewMode,
      sortMetric: s.sortMetric,
    };
    const views = [view, ...s.savedViews].slice(0, 20);
    set({ savedViews: views });
    saveToStorage(views);
  },

  loadView: (id) => {
    const views = get().savedViews;
    const v = views.find((x) => x.id === id);
    if (!v) return;
    set({
      selectedCompanies: v.companies,
      quarterFocus: v.quarters.length === 1 ? v.quarters[0] : v.quarters,
      selectedMetrics: v.metrics,
      normalize: v.normalize,
      showRanks: v.showRanks,
      weights: v.weights,
      viewMode: v.viewMode,
      sortMetric: v.sortMetric,
      activeCompanyFilter: null,
    });
  },

  deleteView: (id) => {
    const views = get().savedViews.filter((x) => x.id !== id);
    set({ savedViews: views });
    saveToStorage(views);
  },

  loadSavedViews: () => set({ savedViews: loadFromStorage() }),
}));
