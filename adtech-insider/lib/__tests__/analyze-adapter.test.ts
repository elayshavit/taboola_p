import { describe, it, expect } from "vitest";
import {
  sanitizeAnalyzeApiResponse,
  buildFallbackAnalyzeResponse,
  analyzeResponseToCompanyData,
  isValidLogoUrl,
} from "../analyze-adapter";

describe("isValidLogoUrl", () => {
  it("rejects http", () => {
    expect(isValidLogoUrl("http://x.com/logo.png")).toBeNull();
  });
  it("accepts https svg", () => {
    expect(isValidLogoUrl("https://x.com/logo.svg")).toBe("https://x.com/logo.svg");
  });
});

describe("sanitizeAnalyzeApiResponse", () => {
  it("fallback for null", () => {
    const r = sanitizeAnalyzeApiResponse(null, "X", 2025);
    expect(r.company.name).toBe("X");
    expect(r.quarters).toHaveLength(4);
  });
});

describe("analyzeResponseToCompanyData", () => {
  it("produces valid CompanyData", () => {
    const fb = buildFallbackAnalyzeResponse("Acme", 2025);
    const d = analyzeResponseToCompanyData("acme", fb);
    expect(d.id).toBe("acme");
    expect(d.quarterly_data).toHaveLength(4);
  });
});
