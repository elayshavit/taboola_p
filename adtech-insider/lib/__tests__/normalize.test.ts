import { describe, it, expect } from "vitest";
import { normalizeCompanies } from "../normalize";

describe("normalizeCompanies", () => {
  it("returns empty for null", () => {
    expect(normalizeCompanies(null)).toEqual([]);
  });
  it("normalizes valid company", () => {
    const input = [{
      id: "test",
      name: "Test",
      quarterly_data: [
        { quarter: "Q1 2025", main_theme: "T", brand_perception: "X", marketing_intensity_score: 50, perception_score: 50, key_activities: [] },
        { quarter: "Q2 2025", main_theme: "", brand_perception: "", marketing_intensity_score: 0, perception_score: 0, key_activities: [] },
        { quarter: "Q3 2025", main_theme: "", brand_perception: "", marketing_intensity_score: 0, perception_score: 0, key_activities: [] },
        { quarter: "Q4 2025", main_theme: "", brand_perception: "", marketing_intensity_score: 0, perception_score: 0, key_activities: [] },
      ],
    }];
    const r = normalizeCompanies(input);
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe("test");
    expect(r[0].quarterlyData).toHaveLength(4);
  });
});
