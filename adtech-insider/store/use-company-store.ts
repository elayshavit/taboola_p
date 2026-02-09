import { create } from "zustand";

interface CompanyState {
  selectedCompany: string | null;
  compareMode: boolean;
  setSelectedCompany: (slug: string | null) => void;
  setCompareMode: (enabled: boolean) => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  selectedCompany: "taboola",
  compareMode: false,
  setSelectedCompany: (slug) => set({ selectedCompany: slug }),
  setCompareMode: (enabled) => set({ compareMode: enabled }),
}));
