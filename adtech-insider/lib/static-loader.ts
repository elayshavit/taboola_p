/**
 * Static company loader for Taboola, Teads, The Trade Desk, Simpli.fi.
 * Bypasses /api/analyze entirely. No network requests.
 */

import type { CompanyData, CompanySlug } from "@/types";
import { getCompanySync } from "@/data/data";
import { STATIC_ENRICHMENT } from "@/data/static/enrichment";

export const STATIC_COMPANIES = new Set<string>([
  "taboola",
  "teads",
  "the-trade-desk",
  "simpli-fi",
]);

/** URL slug aliases -> canonical slug (for common typos/variations) */
const SLUG_ALIASES: Record<string, string> = {
  "trade-desk": "the-trade-desk",
  "trade_desk": "the-trade-desk",
  ttd: "the-trade-desk",
  "thetradedesk": "the-trade-desk",
  simpli: "simpli-fi",
  simplifi: "simpli-fi",
};

export function resolveSlug(slug: string): string {
  const lower = slug.toLowerCase().trim();
  return SLUG_ALIASES[lower] ?? lower;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const cache = new Map<string, { data: CompanyData; expires: number }>();

/** Remove duplicate or near-duplicate text from arrays. */
export function dedupeText(items: string[]): string[] {
  const seen = new Set<string>();
  const normalized = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
  return items.filter((item) => {
    const key = normalized(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeEnrichment(base: CompanyData, slug: string): CompanyData {
  const enrichment = STATIC_ENRICHMENT[slug as keyof typeof STATIC_ENRICHMENT];
  if (!enrichment) return base;

  const highlights = dedupeText([
    ...(base.offerings ?? []),
    ...(enrichment.highlights_extended ?? []),
  ]).slice(0, 7);

  const initiatives = dedupeText([
    ...(enrichment.initiatives_extended ?? []),
  ]).slice(0, 5);

  const risks = (enrichment.risks_extended ?? []).slice(0, 5);

  return {
    ...base,
    strategy_2025_summary:
      enrichment.summary_extended || base.strategy_2025_summary,
    enrichment: {
      summary_extended: enrichment.summary_extended,
      highlights_extended: highlights.length > 0 ? highlights : undefined,
      risks_extended: risks.length > 0 ? risks : undefined,
      initiatives_extended:
        initiatives.length > 0 ? initiatives : undefined,
      faq: enrichment.faq?.length ? enrichment.faq : undefined,
      sources_local: enrichment.sources_local,
    },
  };
}

/**
 * Get fully enriched static company data. No /api/analyze. Cached.
 */
export function getStaticCompanyData(
  slug: string,
  _year: number = 2025
): CompanyData | null {
  const canonicalSlug = resolveSlug(slug);
  const key = `${canonicalSlug}:${_year}`;
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }

  const start = Date.now();
  const base = getCompanySync(canonicalSlug as CompanySlug);
  if (!base) return null;

  const enriched = mergeEnrichment(base, canonicalSlug);
  cache.set(key, { data: enriched, expires: Date.now() + CACHE_TTL_MS });

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(`[perf] static company render ${slug} in ${Date.now() - start}ms`);
  }
  return enriched;
}

export function isStaticCompany(slug: string): boolean {
  return STATIC_COMPANIES.has(resolveSlug(slug));
}
