"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Trophy, Zap, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { CompanyLogo } from "@/components/ui/company-logo";
import { Badge } from "@/components/ui/badge";
import { useCompaniesStore } from "@/store/use-companies-store";
import { getCompanyBrand } from "@/config/brand";
import { cn } from "@/lib/utils";
import type { CompanyCompareMetrics } from "@/lib/compare";
import type { CanonicalCompanyData } from "@/lib/schema";

interface CompareHeadToHeadProps {
  metrics: CompanyCompareMetrics[];
}

const WINNER_THRESHOLD_SCORE = 2; // for 0-100 metrics
const WINNER_THRESHOLD_COUNT = 1; // for activity/peak counts

function formatMetricValue(value: number, asInteger?: boolean): string {
  if (asInteger || Number.isInteger(value)) return String(Math.round(value));
  return value.toFixed(1);
}

function getDisplayValues(
  a: CompanyCompareMetrics,
  b: CompanyCompareMetrics,
  normalized: boolean
): {
  perceptionA: number;
  perceptionB: number;
  intensityA: number;
  intensityB: number;
  activityA: number;
  activityB: number;
  peakA: number;
  peakB: number;
  consistencyA: number;
  consistencyB: number;
  compositeA: number;
  compositeB: number;
} {
  const perceptionA = a.avgBrandScore;
  const perceptionB = b.avgBrandScore;
  const intensityA = a.avgIntensity;
  const intensityB = b.avgIntensity;
  const consistencyA = a.consistency;
  const consistencyB = b.consistency;
  const compositeA = a.compositeScore;
  const compositeB = b.compositeScore;

  let activityA = a.totalActivity;
  let activityB = b.totalActivity;
  let peakA = a.peakIntensity;
  let peakB = b.peakIntensity;

  if (normalized) {
    const actMin = Math.min(activityA, activityB);
    const actMax = Math.max(activityA, activityB);
    const peakMin = Math.min(peakA, peakB);
    const peakMax = Math.max(peakA, peakB);
    const norm = (v: number, lo: number, hi: number) =>
      hi === lo ? 50 : ((v - lo) / (hi - lo)) * 100;
    activityA = actMax > actMin ? norm(activityA, actMin, actMax) : 50;
    activityB = actMax > actMin ? norm(activityB, actMin, actMax) : 50;
    peakA = peakMax > peakMin ? norm(peakA, peakMin, peakMax) : 50;
    peakB = peakMax > peakMin ? norm(peakB, peakMin, peakMax) : 50;
  }

  return {
    perceptionA,
    perceptionB,
    intensityA,
    intensityB,
    activityA,
    activityB,
    peakA,
    peakB,
    consistencyA,
    consistencyB,
    compositeA,
    compositeB,
  };
}

function generateStrengthsAndRisks(
  company: CanonicalCompanyData,
  metrics: CompanyCompareMetrics,
  isLeader: (key: string) => boolean
): { strengths: string[]; risks: string[] } {
  const strengths: string[] = [];
  const risks: string[] = [];
  const q = company.quarterlyData;
  const topQ = [...q].sort((a, b) => b.perceptionScore - a.perceptionScore)[0];
  const lowQ = [...q].sort((a, b) => a.perceptionScore - b.perceptionScore)[0];

  if (topQ) {
    strengths.push(
      `${topQ.quarter}: ${topQ.marketingFocus} — perception ${topQ.perceptionScore}`
    );
  }
  if (isLeader("perception")) {
    strengths.push("Leads in Perception among peers");
  }
  if (isLeader("intensity")) {
    strengths.push("Leads in Marketing Intensity among peers");
  }
  if (metrics.consistency >= 85) {
    strengths.push("High consistency in brand messaging");
  }
  while (strengths.length < 3) {
    strengths.push("Strong quarterly execution and narrative clarity");
  }
  strengths.splice(3);

  if (lowQ && lowQ.perceptionScore < 85) {
    risks.push(
      `${lowQ.quarter} low point: ${lowQ.marketingFocus} (${lowQ.perceptionScore})`
    );
  }
  if (!isLeader("activity") && metrics.totalActivity < 10) {
    risks.push("Lower marketing activity vs peers");
  }
  if (metrics.consistency < 75) {
    risks.push("Variable quarter-over-quarter perception");
  }
  while (risks.length < 3) {
    risks.push("Monitor competitive positioning in key quarters");
  }
  risks.splice(3);

  return { strengths, risks };
}

function DiffCard({
  label,
  valueA,
  valueB,
  nameA,
  nameB,
  higherIsBetter = true,
  asInteger = false,
  threshold,
}: {
  label: string;
  valueA: number;
  valueB: number;
  nameA: string;
  nameB: string;
  higherIsBetter?: boolean;
  asInteger?: boolean;
  threshold: number;
}) {
  const delta = Math.abs(valueA - valueB);
  const isTie = delta < threshold;
  const rawWinner =
    valueA === valueB
      ? null
      : higherIsBetter
      ? valueA > valueB
        ? "A"
        : "B"
      : valueA < valueB
      ? "A"
      : "B";
  const winner = isTie ? null : rawWinner;
  const fmt = (v: number) => formatMetricValue(v, asInteger);
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span
            className="text-[10px] text-muted-foreground truncate max-w-[80px]"
            title={nameA}
          >
            {nameA}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{fmt(valueA)}</span>
            {winner === "A" && (
              <Badge variant="secondary" className="text-[10px]">
                <Trophy className="h-2.5 w-2.5" /> Winner
              </Badge>
            )}
          </div>
        </div>
        <span className="text-muted-foreground text-sm shrink-0">vs</span>
        <div className="flex flex-col gap-0.5 items-end">
          <span
            className="text-[10px] text-muted-foreground truncate max-w-[80px]"
            title={nameB}
          >
            {nameB}
          </span>
          <div className="flex items-center gap-2">
            {winner === "B" && (
              <Badge variant="secondary" className="text-[10px]">
                <Trophy className="h-2.5 w-2.5" /> Winner
              </Badge>
            )}
            <span className="font-medium">{fmt(valueB)}</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Δ {valueA - valueB === 0 ? "0" : `${valueA - valueB >= 0 ? "+" : ""}${formatMetricValue(valueA - valueB, asInteger)}`}
        {isTie && delta > 0 ? " (Tie)" : ""}
      </p>
    </div>
  );
}

export function CompareHeadToHead({ metrics }: CompareHeadToHeadProps) {
  const [mounted, setMounted] = useState(false);
  const [normalized, setNormalized] = useState(false);
  const companies = useCompaniesStore((s) => s.companies);

  useEffect(() => setMounted(true), []);

  const [a, b] = metrics;
  const companyA = useMemo(
    () => (a ? companies.find((c) => c.slug === a.id) : null),
    [companies, a]
  );
  const companyB = useMemo(
    () => (b ? companies.find((c) => c.slug === b.id) : null),
    [companies, b]
  );
  const brandA = a ? getCompanyBrand(a.id) : { accentHex: "#94a3b8" };
  const brandB = b ? getCompanyBrand(b.id) : { accentHex: "#94a3b8" };

  const display = useMemo(() => {
    if (!a || !b) return null;
    return getDisplayValues(a, b, normalized);
  }, [a, b, normalized]);

  const lineData = useMemo(() => {
    if (!a || !b || !companyA || !companyB) return [];
    const qOrder = ["Q1", "Q2", "Q3", "Q4"];
    return qOrder.map((q) => ({
      quarter: `${q} 2025`,
      [a.name]: companyA.quarterlyData.find((x) => x.quarter === q)?.perceptionScore ?? null,
      [b.name]: companyB.quarterlyData.find((x) => x.quarter === q)?.perceptionScore ?? null,
    }));
  }, [companyA, companyB, a, b]);

  const isLeaderA = useMemo(() => {
    if (!a || !b) return () => false;
    return (k: string) =>
      (k === "perception" && a.avgBrandScore > b.avgBrandScore) ||
      (k === "intensity" && a.avgIntensity > b.avgIntensity) ||
      (k === "activity" && a.totalActivity > b.totalActivity) ||
      (k === "peak" && a.peakIntensity > b.peakIntensity);
  }, [a, b]);
  const isLeaderB = useMemo(() => {
    if (!a || !b) return () => false;
    return (k: string) =>
      (k === "perception" && b.avgBrandScore > a.avgBrandScore) ||
      (k === "intensity" && b.avgIntensity > a.avgIntensity) ||
      (k === "activity" && b.totalActivity > a.totalActivity) ||
      (k === "peak" && b.peakIntensity > a.peakIntensity);
  }, [a, b]);

  const strengthsRisksA = useMemo(
    () => (a && companyA ? generateStrengthsAndRisks(companyA, a, isLeaderA) : { strengths: [], risks: [] }),
    [a, companyA, isLeaderA]
  );
  const strengthsRisksB = useMemo(
    () => (b && companyB ? generateStrengthsAndRisks(companyB, b, isLeaderB) : { strengths: [], risks: [] }),
    [b, companyB, isLeaderB]
  );

  const verdict = useMemo(() => {
    if (!a || !b || !display) return "";
    const leaders: string[] = [];
    const thresholdScore = WINNER_THRESHOLD_SCORE;
    const thresholdCount = WINNER_THRESHOLD_COUNT;
    if (display.perceptionA - display.perceptionB >= thresholdScore)
      leaders.push(a.name);
    else if (display.perceptionB - display.perceptionA >= thresholdScore)
      leaders.push(b.name);
    if (display.intensityA - display.intensityB >= thresholdScore && !leaders.includes(a.name))
      leaders.push(a.name);
    else if (display.intensityB - display.intensityA >= thresholdScore && !leaders.includes(b.name))
      leaders.push(b.name);
    if (Math.abs(display.compositeA - display.compositeB) >= 0.02) {
      if (display.compositeA > display.compositeB && !leaders.includes(a.name))
        leaders.push(a.name);
      else if (display.compositeB > display.compositeA && !leaders.includes(b.name))
        leaders.push(b.name);
    }
    const unique = [...new Set(leaders)];
    if (unique.length === 0) return "Overall: Tie — both companies show comparable strength across metrics.";
    if (unique.length === 1) return `${unique[0]} leads on key metrics (Perception, Intensity, or Composite).`;
    return `${unique.join(" and ")} lead on different dimensions; overall positioning is close.`;
  }, [a, b, display]);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 h-[120px] rounded-xl bg-muted/40 animate-pulse" />
        <div className="h-[280px] rounded-xl bg-muted/40 animate-pulse" />
      </div>
    );
  }

  if (!a || !b) {
    return (
      <div className="rounded-xl glass-card p-8 text-center text-muted-foreground">
        Select exactly 2 companies to compare in Head-to-Head mode.
      </div>
    );
  }

  const diffConfig = display
    ? [
        {
          label: "Perception",
          valueA: display.perceptionA,
          valueB: display.perceptionB,
          asInteger: false,
          threshold: WINNER_THRESHOLD_SCORE,
        },
        {
          label: "Intensity",
          valueA: display.intensityA,
          valueB: display.intensityB,
          asInteger: false,
          threshold: WINNER_THRESHOLD_SCORE,
        },
        {
          label: "Activity",
          valueA: display.activityA,
          valueB: display.activityB,
          asInteger: !normalized,
          threshold: normalized ? WINNER_THRESHOLD_SCORE : WINNER_THRESHOLD_COUNT,
        },
        {
          label: "Peak",
          valueA: display.peakA,
          valueB: display.peakB,
          asInteger: !normalized,
          threshold: normalized ? WINNER_THRESHOLD_SCORE : WINNER_THRESHOLD_COUNT,
        },
        {
          label: "Consistency",
          valueA: display.consistencyA,
          valueB: display.consistencyB,
          asInteger: false,
          threshold: WINNER_THRESHOLD_SCORE,
        },
        {
          label: "Composite",
          valueA: display.compositeA,
          valueB: display.compositeB,
          asInteger: false,
          threshold: 0.02,
        },
      ]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Head-to-Head</h3>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={normalized}
            onChange={(e) => setNormalized(e.target.checked)}
            className="rounded border-border"
          />
          Normalize (Activity & Peak)
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {diffConfig.map(({ label, valueA, valueB, asInteger, threshold }) => (
          <DiffCard
            key={label}
            label={label}
            valueA={valueA}
            valueB={valueB}
            nameA={a.name}
            nameB={b.name}
            asInteger={asInteger}
            threshold={threshold}
          />
        ))}
      </div>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quarterly Perception (Q1–Q4)</h3>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={lineData}
              margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="quarter"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={{ stroke: "var(--border)" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={a.name}
                stroke={brandA.accentHex}
                strokeWidth={2}
                dot={{ fill: brandA.accentHex, r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey={b.name}
                stroke={brandB.accentHex}
                strokeWidth={2}
                dot={{ fill: brandB.accentHex, r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard accent={a.id} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CompanyLogo slug={a.id} name={a.name} size="lg" variant="avatar" />
            <div>
              <h3 className="font-semibold text-lg">{a.name}</h3>
              <p className="text-sm text-muted-foreground">{a.tagline}</p>
            </div>
          </div>
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4" />
            Strengths
          </h4>
          <ul className="space-y-2 mb-4">
            {strengthsRisksA.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm before:content-['•'] before:text-primary">
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4" />
            Risks
          </h4>
          <ul className="space-y-2">
            {strengthsRisksA.risks.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm before:content-['•'] before:text-destructive">
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard accent={b.id} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CompanyLogo slug={b.id} name={b.name} size="lg" variant="avatar" />
            <div>
              <h3 className="font-semibold text-lg">{b.name}</h3>
              <p className="text-sm text-muted-foreground">{b.tagline}</p>
            </div>
          </div>
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4" />
            Strengths
          </h4>
          <ul className="space-y-2 mb-4">
            {strengthsRisksB.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm before:content-['•'] before:text-primary">
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4" />
            Risks
          </h4>
          <ul className="space-y-2">
            {strengthsRisksB.risks.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm before:content-['•'] before:text-destructive">
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {verdict && (
        <GlassCard className="p-4 border-primary/30 bg-primary/5">
          <p className="text-sm font-medium">Verdict</p>
          <p className="text-muted-foreground text-sm mt-1">{verdict}</p>
        </GlassCard>
      )}
    </motion.div>
  );
}
