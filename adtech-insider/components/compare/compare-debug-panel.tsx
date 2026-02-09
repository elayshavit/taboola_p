"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import type { CompanyCompareMetrics } from "@/lib/compare";
import type { CompareDebugInfo } from "@/lib/compare";

interface CompareDebugPanelProps {
  companies: CompanyCompareMetrics[];
  debugInfo: CompareDebugInfo;
}

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

export function CompareDebugPanel({ companies, debugInfo }: CompareDebugPanelProps) {
  const [open, setOpen] = useState(false);

  if (!isDev()) return null;

  const hasWarnings = debugInfo.warnings.length > 0;
  const { normBounds } = debugInfo;

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
        Compare Debug (dev only)
        {hasWarnings && (
          <AlertTriangle className="ml-1 h-4 w-4 text-amber-600" aria-hidden />
        )}
      </button>
      {open && (
        <div className="border-t border-amber-500/20 px-3 py-3 space-y-3">
          {hasWarnings && (
            <div
              role="alert"
              className="rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200"
            >
              <strong>Data warnings:</strong>
              <ul className="mt-1 list-disc pl-4">
                {debugInfo.warnings.map((w, i) => (
                  <li key={i}>
                    {w.companyId} – {w.metric}: {w.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="text-xs">
            <p className="font-medium text-muted-foreground mb-2">
              Normalization bounds (min / max)
            </p>
            <ul className="space-y-0.5 text-muted-foreground">
              <li>
                Perception: {normBounds.perception.min} / {normBounds.perception.max}
              </li>
              <li>
                Intensity: {normBounds.intensity.min} / {normBounds.intensity.max}
              </li>
              <li>
                Activity: {normBounds.activity.min} / {normBounds.activity.max}
              </li>
              <li>
                Peak: {normBounds.peak.min} / {normBounds.peak.max}
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-muted-foreground text-xs">
              Raw → Normalized (chart) per company
            </p>
            <ul className="space-y-2">
              {companies.map((m) => (
                <li
                  key={m.id}
                  className="rounded border border-border/50 bg-muted/20 px-2 py-2 text-xs"
                >
                  <span className="font-medium">{m.name}</span>
                  {m.warnings.length > 0 && (
                    <span className="ml-1 text-amber-600">({m.warnings.join("; ")})</span>
                  )}
                  <ul className="mt-1.5 space-y-0.5 text-muted-foreground">
                    <li>
                      Perception: raw {m.avgBrandScore.toFixed(1)} → chart{" "}
                      {m.normalizedBrandScore.toFixed(1)}
                    </li>
                    <li>
                      Intensity: raw {m.avgIntensity.toFixed(1)} → chart{" "}
                      {m.normalizedIntensity.toFixed(1)}
                    </li>
                    <li>
                      Activity: raw {m.totalActivity} → chart{" "}
                      {m.normalizedActivity.toFixed(1)}
                    </li>
                    <li>
                      Peak: raw {m.peakIntensity} → chart{" "}
                      {m.normalizedPeakIntensity.toFixed(1)}
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
