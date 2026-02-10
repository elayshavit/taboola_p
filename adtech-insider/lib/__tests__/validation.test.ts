/**
 * Tests for validation utilities.
 */

import { describe, it, expect } from "vitest";
import {
  normalizeSlug,
  ensureString,
  ensureStringArray,
  ensureQuarterlyData,
  validateCompanyData,
} from "../validation";

describe("normalizeSlug", () => {
  it("normalizes spaces to hyphens", () => {
    expect(normalizeSlug("The Trade Desk")).toBe("the-trade-desk");
  });

  it("returns unknown for empty", () => {
    expect(normalizeSlug("")).toBe("unknown");
    expect(normalizeSlug("   ")).toBe("unknown");
  });
});

describe("ensureString", () => {
  it("returns trimmed string", () => {
    expect(ensureString("  hello  ", "x")).toBe("hello");
  });

  it("returns fallback for non-string", () => {
    expect(ensureString(null, "fallback")).toBe("fallback");
    expect(ensureString(123, "fallback")).toBe("fallback");
  });
});

describe("ensureStringArray", () => {
  it("filters and cleans array", () => {
    expect(ensureStringArray(["a", "  b  ", ""], [])).toEqual(["a", "b"]);
  });

  it("returns fallback for non-array", () => {
    expect(ensureStringArray(null, ["x"])).toEqual(["x"]);
  });
});

describe("ensureQuarterlyData", () => {
  it("returns 4 quarters for empty input", () => {
    const result = ensureQuarterlyData(null);
    expect(result).toHaveLength(4);
    expect(result[0].quarter).toBe("Q1 2025");
  });

  it("clamps scores to 0-100", () => {
    const result = ensureQuarterlyData([
      { perception_score: 150, marketing_intensity_score: -10, key_activities: [] },
    ]);
    expect(result[0].perception_score).toBeLessThanOrEqual(100);
    expect(result[0].marketing_intensity_score).toBeGreaterThanOrEqual(0);
  });
});

describe("validateCompanyData", () => {
  it("returns null for null input", () => {
    expect(validateCompanyData(null)).toBeNull();
  });

  it("produces valid CompanyData with defaults", () => {
    const result = validateCompanyData({ name: "Test" }, "test");
    expect(result).not.toBeNull();
    expect(result!.quarterly_data).toHaveLength(4);
    expect(result!.offerings).toEqual([]);
  });
});
