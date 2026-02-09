import type { CompanySlug } from "@/types";

export const NAV_ITEMS: { slug: CompanySlug | "compare"; label: string }[] = [
  { slug: "taboola", label: "Taboola" },
  { slug: "teads", label: "Teads" },
  { slug: "the-trade-desk", label: "The Trade Desk" },
  { slug: "simpli-fi", label: "Simpli.fi" },
  { slug: "compare", label: "Compare All" },
];

export const COMPANY_COLORS: Record<CompanySlug, string> = {
  taboola: "#e94d35",
  teads: "#00a4e4",
  "the-trade-desk": "#0f766e",
  "simpli-fi": "#7c3aed",
  criteo: "#FF6600",
};

export const SITE_NAME = "AdTech Insider";
