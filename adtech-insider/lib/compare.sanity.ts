import type { CanonicalCompanyData } from "@/lib/schema";
import { isValidFiniteNumber } from "./metrics";

export interface SanityCheckResult {
  ok: boolean;
  errors: string[];
}

/**
 * Run sanity checks on canonical company data.
 * - All companies have 4 quarters
 * - perception/intensity within 0..100 for all quarters
 * - activity/peak >= 0 (activity = events + reports per quarter)
 * - No NaN
 */
export function runCompareSanityChecks(
  companies: CanonicalCompanyData[]
): SanityCheckResult {
  const errors: string[] = [];

  for (const c of companies) {
    if (c.quarterlyData.length !== 4) {
      errors.push(`${c.slug}: expected 4 quarters, got ${c.quarterlyData.length}`);
    }

    for (const q of c.quarterlyData) {
      if (!isValidFiniteNumber(q.perceptionScore)) {
        errors.push(`${c.slug} ${q.quarter}: invalid perceptionScore`);
      } else if (q.perceptionScore < 0 || q.perceptionScore > 100) {
        errors.push(
          `${c.slug} ${q.quarter}: perceptionScore ${q.perceptionScore} out of 0-100`
        );
      }
      if (!isValidFiniteNumber(q.intensityScore)) {
        errors.push(`${c.slug} ${q.quarter}: invalid intensityScore`);
      } else if (q.intensityScore < 0 || q.intensityScore > 100) {
        errors.push(
          `${c.slug} ${q.quarter}: intensityScore ${q.intensityScore} out of 0-100`
        );
      }
      const eventsLen = q.events?.length ?? 0;
      const reportsLen = q.reportsPublished?.length ?? 0;
      const activity = eventsLen + reportsLen;
      if (!Number.isFinite(activity) || activity < 0) {
        errors.push(`${c.slug} ${q.quarter}: invalid activity (events+reports)`);
      }
    }
  }

  if (errors.length > 0 && process.env.NODE_ENV === "development") {
    console.warn("[compare.sanity] Checks failed:", {
      ok: false,
      errors,
    });
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
