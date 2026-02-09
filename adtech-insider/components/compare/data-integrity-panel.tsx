"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import type { CanonicalCompanyData } from "@/lib/schema";
import type { CompanyCompareMetrics } from "@/lib/compare";

interface DataIntegrityPanelProps {
  companies: CanonicalCompanyData[];
  metrics: CompanyCompareMetrics[];
}

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

export function DataIntegrityPanel({ companies, metrics }: DataIntegrityPanelProps) {
  const [open, setOpen] = useState(false);

  if (!isDev()) return null;

  const rows = companies.map((c) => {
    const m = metrics.find((x) => x.id === c.slug);
    const quartersOk = c.quarterlyData.length === 4;
    const hasNaN =
      m &&
      (Number.isNaN(m.avgBrandScore) ||
        Number.isNaN(m.avgIntensity) ||
        Number.isNaN(m.totalActivity) ||
        Number.isNaN(m.peakIntensity));
    const valid = quartersOk && !hasNaN;

    return {
      company: c.companyName,
      quarters: c.quarterlyData.length,
      quartersOk,
      activity: m?.totalActivity ?? 0,
      intensity: m?.avgIntensity ?? 0,
      peak: m?.peakIntensity ?? 0,
      perception: m?.avgBrandScore ?? 0,
      hasNaN: !!hasNaN,
      valid,
    };
  });

  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-amber-800 dark:text-amber-200"
      >
        {open ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        Data Integrity Panel (dev only)
      </button>
      {open && (
        <div className="border-t border-amber-500/20 px-3 py-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left font-medium">Company</th>
                <th className="text-center">Quarters</th>
                <th className="text-center">Activity</th>
                <th className="text-center">Intensity</th>
                <th className="text-center">Peak</th>
                <th className="text-center">Perception</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.company} className="border-t border-border/40">
                  <td className="py-1.5 font-medium">{r.company}</td>
                  <td className="text-center">
                    {r.quarters}
                    {!r.quartersOk && (
                      <span className="ml-1 text-amber-600" title="Expected 4">
                        !
                      </span>
                    )}
                  </td>
                  <td className="text-center">{r.activity}</td>
                  <td className="text-center">{r.intensity.toFixed(1)}</td>
                  <td className="text-center">{r.peak.toFixed(1)}</td>
                  <td className="text-center">{r.perception.toFixed(1)}</td>
                  <td className="text-center">
                    {r.valid ? (
                      <CheckCircle2 className="inline h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="inline h-4 w-4 text-amber-600" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
