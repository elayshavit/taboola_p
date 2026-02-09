import { describe, it, expect } from "vitest";
import { normalizeScores } from "./normalizeScores";

describe("normalizeScores", () => {

  it("normalizes values to 0-100 range", () => {
    const result = normalizeScores([10, 20, 30, 40, 50]);
    expect(result[0]).toBe(0);
    expect(result[4]).toBe(100);
    expect(result[2]).toBeCloseTo(50);
  });

  it("returns all 50 when max equals min", () => {
    const result = normalizeScores([5, 5, 5]);
    expect(result).toEqual([50, 50, 50]);
  });

  it("handles single value", () => {
    const result = normalizeScores([42]);
    expect(result).toEqual([50]);
  });

  it("handles NaN - returns 0 and does not throw", () => {
    const result = normalizeScores([10, NaN, 30]);
    expect(result[1]).toBe(0);
    expect(result[0]).toBe(0);
    expect(result[2]).toBe(100);
  });

  it("handles Infinity - returns 0 for invalid", () => {
    const result = normalizeScores([10, Infinity, 30]);
    expect(result[1]).toBe(0);
  });

  it("handles empty array", () => {
    const result = normalizeScores([]);
    expect(result).toEqual([]);
  });

  it("handles all NaN/Infinity - returns zeros", () => {
    const result = normalizeScores([NaN, Infinity, -Infinity]);
    expect(result).toEqual([0, 0, 0]);
  });
});
