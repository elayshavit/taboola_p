import type { CompanySlug } from "@/types";

export type LogoMarkMode = "logo" | "monogram";

export interface CompanyBrand {
  accent: string;
  accentHex: string;
  accentLight: string;
  accentDark: string;
  gradient: string;
  gradientFrom: string;
  gradientTo: string;
  surfaceTint: string;
  chartPalette: [string, string, string, string, string];
  iconBgGradient: string;
  logoSrc: string;
  logoAlt: string;
  markMode: LogoMarkMode;
  fallbackMonogram: string;
}

export const COMPANY_BRANDS: Record<CompanySlug, CompanyBrand> = {
  taboola: {
    accent: "oklch(0.6 0.22 250)",
    accentHex: "#4a6cf7",
    accentLight: "oklch(0.85 0.12 250)",
    accentDark: "oklch(0.5 0.22 250)",
    gradient: "linear-gradient(135deg, oklch(0.7 0.18 250), oklch(0.55 0.22 240))",
    gradientFrom: "oklch(0.7 0.18 250)",
    gradientTo: "oklch(0.55 0.22 240)",
    surfaceTint: "oklch(0.98 0.02 250)",
    iconBgGradient: "linear-gradient(135deg, oklch(0.7 0.18 250), oklch(0.55 0.22 240))",
    logoSrc: "/logos/taboola.png",
    logoAlt: "Taboola logo",
    markMode: "logo",
    fallbackMonogram: "T",
    chartPalette: [
      "oklch(0.65 0.22 250)",
      "oklch(0.75 0.16 250)",
      "oklch(0.55 0.2 240)",
      "oklch(0.7 0.14 245)",
      "oklch(0.6 0.18 255)",
    ],
  },
  teads: {
    accent: "oklch(0.6 0.26 305)",
    accentHex: "#a855f7",
    accentLight: "oklch(0.85 0.14 305)",
    accentDark: "oklch(0.5 0.26 305)",
    gradient: "linear-gradient(135deg, oklch(0.7 0.2 305), oklch(0.55 0.26 295))",
    gradientFrom: "oklch(0.7 0.2 305)",
    gradientTo: "oklch(0.55 0.26 295)",
    surfaceTint: "oklch(0.98 0.025 305)",
    iconBgGradient: "linear-gradient(135deg, oklch(0.7 0.2 305), oklch(0.55 0.26 295))",
    logoSrc: "/logos/teads.png",
    logoAlt: "Teads logo",
    markMode: "logo",
    fallbackMonogram: "Te",
    chartPalette: [
      "oklch(0.65 0.26 305)",
      "oklch(0.75 0.2 305)",
      "oklch(0.55 0.24 295)",
      "oklch(0.7 0.18 310)",
      "oklch(0.6 0.22 300)",
    ],
  },
  "the-trade-desk": {
    accent: "oklch(0.55 0.24 264)",
    accentHex: "#6366f1",
    accentLight: "oklch(0.82 0.14 264)",
    accentDark: "oklch(0.48 0.24 264)",
    gradient: "linear-gradient(135deg, oklch(0.65 0.22 264), oklch(0.5 0.24 254))",
    gradientFrom: "oklch(0.65 0.22 264)",
    gradientTo: "oklch(0.5 0.24 254)",
    surfaceTint: "oklch(0.98 0.02 264)",
    iconBgGradient: "linear-gradient(135deg, oklch(0.65 0.22 264), oklch(0.5 0.24 254))",
    logoSrc: "/logos/the-trade-desk.png",
    logoAlt: "The Trade Desk logo",
    markMode: "logo",
    fallbackMonogram: "TTD",
    chartPalette: [
      "oklch(0.6 0.24 264)",
      "oklch(0.7 0.18 264)",
      "oklch(0.5 0.22 254)",
      "oklch(0.65 0.2 270)",
      "oklch(0.55 0.2 258)",
    ],
  },
  criteo: {
    accent: "oklch(0.65 0.2 35)",
    accentHex: "#FF6600",
    accentLight: "oklch(0.85 0.12 35)",
    accentDark: "oklch(0.55 0.2 35)",
    gradient: "linear-gradient(135deg, oklch(0.75 0.18 35), oklch(0.6 0.2 30))",
    gradientFrom: "oklch(0.75 0.18 35)",
    gradientTo: "oklch(0.6 0.2 30)",
    surfaceTint: "oklch(0.98 0.02 35)",
    iconBgGradient: "linear-gradient(135deg, oklch(0.75 0.18 35), oklch(0.6 0.2 30))",
    logoSrc: "/logos/criteo.png",
    logoAlt: "Criteo logo",
    markMode: "logo",
    fallbackMonogram: "C",
    chartPalette: [
      "oklch(0.7 0.2 35)",
      "oklch(0.75 0.16 35)",
      "oklch(0.6 0.18 30)",
      "oklch(0.65 0.15 40)",
      "oklch(0.55 0.2 32)",
    ],
  },
  "simpli-fi": {
    accent: "oklch(0.6 0.18 165)",
    accentHex: "#22c55e",
    accentLight: "oklch(0.85 0.1 165)",
    accentDark: "oklch(0.5 0.18 165)",
    gradient: "linear-gradient(135deg, oklch(0.7 0.16 165), oklch(0.55 0.18 155))",
    gradientFrom: "oklch(0.7 0.16 165)",
    gradientTo: "oklch(0.55 0.18 155)",
    surfaceTint: "oklch(0.98 0.02 165)",
    iconBgGradient: "linear-gradient(135deg, oklch(0.7 0.16 165), oklch(0.55 0.18 155))",
    logoSrc: "/logos/simpli-fi.png",
    logoAlt: "Simpli.fi logo",
    markMode: "logo",
    fallbackMonogram: "S",
    chartPalette: [
      "oklch(0.65 0.18 165)",
      "oklch(0.75 0.14 165)",
      "oklch(0.55 0.16 155)",
      "oklch(0.7 0.12 170)",
      "oklch(0.6 0.15 160)",
    ],
  },
};

const DEFAULT_BRAND = COMPANY_BRANDS["the-trade-desk"];

export function getCompanyBrand(slug: string): CompanyBrand {
  return (COMPANY_BRANDS as Record<string, CompanyBrand>)[slug] ?? DEFAULT_BRAND;
}
