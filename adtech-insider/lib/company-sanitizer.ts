/**
 * Sanitize raw company input before validation.
 * Coerces malformed fields and rejects clearly invalid data.
 */

function toSlug(value: string | undefined): string {
  if (typeof value !== "string" || !value.trim()) return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isValidLogoUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("https://")) return null;
  if (!/\.(svg|png|jpg|jpeg|webp)$/i.test(trimmed)) return null;
  return trimmed;
}

export interface SanitizedRawCompany {
  name: string;
  slug: string;
  id: string;
  tagline?: string;
  overview?: string;
  strategy_2025_summary?: string;
  offerings?: string[];
  quarterly_data?: unknown[];
  logo?: string | null;
  [key: string]: unknown;
}

/**
 * Sanitize raw companies array: normalize basics and drop invalid rows.
 * Returns an array of objects suitable for schema validation.
 */
export function sanitizeRawCompanies(input: unknown): SanitizedRawCompany[] {
  if (!Array.isArray(input)) return [];

  const result: SanitizedRawCompany[] = [];

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (!c || typeof c !== "object") continue;

    const name =
      typeof c.name === "string" && c.name.trim().length > 0
        ? c.name.trim()
        : null;

    const slugFromSlug = typeof c.slug === "string" ? toSlug(c.slug) : "";
    const slugFromId = typeof c.id === "string" ? toSlug(c.id) : "";
    const slugFromName = name ? toSlug(name) : "";
    const slug = slugFromSlug || slugFromId || slugFromName || null;

    if (!name || !slug) continue;

    const id = slugFromId || slugFromSlug || slug;

    const logoUrl = isValidLogoUrl(c.logo);

    result.push({
      ...c,
      id,
      name,
      slug,
      tagline: typeof c.tagline === "string" ? c.tagline : undefined,
      overview: typeof c.overview === "string" ? c.overview : undefined,
      strategy_2025_summary:
        typeof c.strategy_2025_summary === "string"
          ? c.strategy_2025_summary
          : typeof (c as Record<string, unknown>).strategy2025Summary === "string"
            ? (c as Record<string, unknown>).strategy2025Summary as string
            : undefined,
      offerings: Array.isArray(c.offerings) ? c.offerings : undefined,
      quarterly_data: Array.isArray(c.quarterly_data)
        ? c.quarterly_data
        : Array.isArray((c as Record<string, unknown>).quarters)
          ? (c as Record<string, unknown>).quarters as unknown[]
          : undefined,
      logo: logoUrl ?? undefined,
    });
  }

  return result;
}
