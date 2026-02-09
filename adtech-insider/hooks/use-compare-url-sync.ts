"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useCompareStore } from "@/store/use-compare-store";
import type { CompanySlug } from "@/types";

function parseCompanies(s: string | null): CompanySlug[] {
  if (!s) return [];
  const slugs = s.split(",").filter(Boolean) as CompanySlug[];
  const valid: CompanySlug[] = ["taboola", "teads", "the-trade-desk", "simpli-fi", "criteo"];
  return slugs.filter((x) => valid.includes(x)).slice(0, 4);
}

function parseQuarters(s: string | null): string[] {
  if (!s) return [];
  const q = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"];
  return s.split(",").filter((x) => q.includes(x));
}

function parseMetrics(s: string | null): string[] {
  if (!s) return [];
  const m = ["brand", "innovation", "presence", "activity", "peak", "consistency"];
  return s.split(",").filter((x) => m.includes(x));
}

function parseWeights(s: string | null): Record<string, number> {
  if (!s) return {};
  const out: Record<string, number> = {};
  const re = /([bipa])(\d+)/g;
  const map: Record<string, string> = { b: "brand", i: "innovation", p: "presence", a: "activity" };
  let match: RegExpExecArray | null;
  while ((match = re.exec(s)) !== null) {
    out[map[match[1]]] = parseInt(match[2], 10);
  }
  return out;
}

function buildUrlParams(s: ReturnType<typeof useCompareStore.getState>): string {
  const params = new URLSearchParams();
  if (s.selectedCompanies.length > 0) params.set("companies", s.selectedCompanies.join(","));
  const q = Array.isArray(s.quarterFocus) ? s.quarterFocus : s.quarterFocus === "all" ? [] : [s.quarterFocus];
  if (q.length > 0) params.set("quarters", q.join(","));
  if (s.selectedMetrics.length > 0) params.set("metrics", s.selectedMetrics.join(","));
  params.set("normalize", s.normalize ? "1" : "0");
  params.set("mode", s.viewMode);
  const w = s.weights;
  params.set("weights", `b${w.brand},i${w.innovation},p${w.presence},a${w.activity}`);
  return params.toString();
}

export function useCompareUrlSync() {
  const searchParams = useSearchParams();
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    const store = useCompareStore.getState();
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    const companies = parseCompanies(params.get("companies"));
    const quarters = parseQuarters(params.get("quarters"));
    const metrics = parseMetrics(params.get("metrics"));
    const normalize = params.get("normalize") === "1";
    const mode = params.get("mode") as "cards" | "table" | null;
    const weights = parseWeights(params.get("weights"));

    if (companies.length >= 2) store.setSelectedCompanies(companies);
    if (quarters.length > 0) store.setQuarterFocus(quarters as ("Q1 2025" | "Q2 2025" | "Q3 2025" | "Q4 2025")[]);
    if (metrics.length > 0) store.setSelectedMetrics(metrics as Parameters<typeof store.setSelectedMetrics>[0]);
    store.setNormalize(normalize);
    if (mode && ["cards", "table"].includes(mode)) store.setViewMode(mode);
    if (Object.keys(weights).length === 4) store.setWeights(weights);
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const unsub = useCompareStore.subscribe(() => {
      const s = useCompareStore.getState();
      const next = buildUrlParams(s);
      const current = window.location.search.slice(1);
      if (next !== current) {
        const url = next ? `${window.location.pathname}?${next}` : window.location.pathname;
        window.history.replaceState(null, "", url);
      }
    });
    return unsub;
  }, []);
}
