# AdTech Insider – Full-System Audit Summary

## Overview
Comprehensive audit performed to ensure correctness, performance, stability, and resilience across the application.

---

## 1. Data Flow Validation

### Static pipeline
- **rawCompaniesJson** → sanitizeRawCompanies → parseInputJsonWithFallback → normalizeCompany → canonicalToCompanyData → UI
- All 4 static companies (taboola, teads, the-trade-desk, simpli-fi) validated.
- **Bug fix**: `mergeEnrichment` now uses `canonicalSlug` instead of raw `slug`, so alias URLs (e.g. `/company/trade-desk`) receive correct enrichment.

### Dynamic pipeline
- **LLM response** → extractJson → sanitizeAnalyzeApiResponse → analyzeResponseToCompanyData → UI
- Sanitization ensures schema-compliant shapes; fallback used on malformed JSON.
- Client handles `res.text()` then `JSON.parse` with try/catch; handles HTTP error bodies correctly.

---

## 2. API Hardening (`/api/analyze`)

- **Invalid JSON body**: Returns 400 with clear error.
- **Empty/malformed companyName**: Returns 400.
- **LLM invalid JSON**: Warn logged; fallback payload returned (200).
- **LLM response text() throws**: Caught; fallback used.
- **Response with `error` key**: Treated as invalid; fallback used.
- **Missing GEMINI_API_KEY**: Fallback returned (no 500).
- **In-flight dedupe**: `pendingRequests` map prevents duplicate concurrent requests.
- **Memo cache**: `analyzeCache` caches successful responses.

---

## 3. Static Companies

- **No network calls** for taboola, teads, the-trade-desk, simpli-fi.
- **Slug aliases**: trade-desk, ttd, simpli → resolve to canonical.
- **Enrichment**: summary, highlights, risks, initiatives, FAQ merged from `data/static/enrichment.ts`.
- **30-min cache** for static company data.
- **Snapshot tests** in `lib/__tests__/static-loader.test.ts`.

---

## 4. Performance

- **Static loader**: 30-min in-memory cache.
- **Analyze API**: In-memory cache + in-flight dedupe.
- **Lazy loading**: QuarterTimeline and BubbleChart use `dynamic()` with `ssr: false` and skeletons.
- **Logs** (dev only):
  - `[perf] static company render {slug} in Xms`
  - `[perf] static company above-the-fold {slug} in Xms`
  - `[perf] dynamic analyze completed {companyName} in Xms`
  - `[perf] normalize N companies in Xms`

---

## 5. Stability

- **Error Boundary** around company page (`components/ui/error-boundary.tsx`).
- **Defensive guards** in KpiGrid, HeroHeader, QuarterTimeline, BubbleChart for `quarterly_data`, `key_activities`.
- **Command center**: Null-safe `quarterly_data` and `key_activities` in `buildDeepResults`.
- **Client fetch**: Uses `res.text()` then `JSON.parse`; handles non-JSON and parse errors.
- **analyze-adapter**: Warns on validation failure; uses `companyObj` with fallbacks.

---

## 6. Centralized Validation

- **`lib/validation.ts`**:
  - `normalizeSlug`, `ensureString`, `ensureStringArray`
  - `ensureQuarterlyData` – 4 quarters with safe defaults
  - `validateCompanyData` – optional guard for UI-bound data

---

## 7. Automated Tests

| File | Coverage |
|------|----------|
| `lib/__tests__/normalize.test.ts` | normalizeCompanies |
| `lib/__tests__/analyze-adapter.test.ts` | sanitizeAnalyzeApiResponse, buildFallbackAnalyzeResponse, analyzeResponseToCompanyData, isValidLogoUrl |
| `lib/__tests__/static-loader.test.ts` | getStaticCompanyData, isStaticCompany, resolveSlug, enrichment |
| `lib/__tests__/validation.test.ts` | normalizeSlug, ensureString, ensureStringArray, ensureQuarterlyData, validateCompanyData |

**Run tests**: `npm run test`

---

## 8. Regression Prevention

- **KpiGrid undefined**: Fixed with regular imports (no dynamic).
- **Blank company pages**: Error boundary + null guards.
- **Alias slugs (trade-desk, simpli)**: resolveSlug + mergeEnrichment(canonicalSlug).
- **Malformed LLM JSON**: Fallback payload; no crash.
- **Empty quarterly_data**: Guards in all consuming components.

---

## Files Modified

- `lib/static-loader.ts` – canonicalSlug in mergeEnrichment
- `lib/analyze-adapter.ts` – Warnings, companyObj fallbacks
- `app/api/analyze/route.ts` – JSON parse guard, error handling
- `components/company/company-page-client.tsx` – Fetch handling, perf log
- `components/command/command-center.tsx` – Null-safe deep results
- `lib/validation.ts` – **New** – centralized guards
- `components/ui/error-boundary.tsx` – **Existing** – error boundary
- `package.json` – test scripts
- `vitest.config.ts` – **New**
- `lib/__tests__/*.test.ts` – **New** – 4 test files
