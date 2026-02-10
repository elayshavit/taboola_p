/**
 * Tests for static company loader.
 */

import { describe, it, expect } from "vitest";
import { getStaticCompanyData, isStaticCompany, resolveSlug, STATIC_COMPANIES } from "../static-loader";

describe("STATIC_COMPANIES", () => {
  it("contains 4 companies", () => {
    expect(STATIC_COMPANIES.size).toBe(4);
  });
});

describe("isStaticCompany", () => {
  it("returns true for taboola, teads, the-trade-desk, simpli-fi", () => {
    expect(isStaticCompany("taboola")).toBe(true);
    expect(isStaticCompany("teads")).toBe(true);
    expect(isStaticCompany("the-trade-desk")).toBe(true);
    expect(isStaticCompany("simpli-fi")).toBe(true);
  });
  it("returns true for alias trade-desk", () => {
    expect(isStaticCompany("trade-desk")).toBe(true);
  });
});

describe("resolveSlug", () => {
  it("resolves trade-desk to the-trade-desk", () => {
    expect(resolveSlug("trade-desk")).toBe("the-trade-desk");
  });
});

describe("getStaticCompanyData", () => {
  it("returns data for taboola", () => {
    const data = getStaticCompanyData("taboola");
    expect(data).not.toBeNull();
    expect(data!.id).toBe("taboola");
    expect(data!.quarterly_data).toHaveLength(4);
  });
  it("returns enriched data with highlights", () => {
    const data = getStaticCompanyData("taboola");
    expect(data!.enrichment?.highlights_extended?.length).toBeGreaterThan(0);
  });
  it("returns null for unknown slug", () => {
    expect(getStaticCompanyData("unknown-xyz")).toBeNull();
  });
});
