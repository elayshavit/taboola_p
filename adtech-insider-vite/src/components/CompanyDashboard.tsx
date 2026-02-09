import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { Company } from "@/types/company";
import { METRIC_CONFIG } from "@/config/metrics";
import { CompanyLogo } from "./CompanyLogo";

interface CompanyDashboardProps {
  company: Company;
  allCompanies: Company[];
}

function KpiCard({
  label,
  value,
  delta,
  color,
}: {
  label: string;
  value: number;
  delta: number | null;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color }}>
        {Number.isInteger(value) ? value : value.toFixed(1)}
      </p>
      {delta !== null && (
        <p className={`text-xs mt-1 ${delta >= 0 ? "text-green-600" : "text-red-600"}`}>
          {delta >= 0 ? "+" : ""}{delta.toFixed(1)} vs avg
        </p>
      )}
    </div>
  );
}

function MiniLineChart({
  data,
  hoveredQuarter,
}: {
  data: { quarter: string; perception: number; intensity: number }[];
  hoveredQuarter: string | null;
}) {
  const filtered = hoveredQuarter ? data.filter((d) => d.quarter === hoveredQuarter) : data;
  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={filtered} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={24} />
        <Tooltip />
        <Line type="monotone" dataKey="perception" stroke="#14b8a6" strokeWidth={2} dot={{ r: 2 }} />
        <Line type="monotone" dataKey="intensity" stroke="#a855f7" strokeWidth={2} dot={{ r: 2 }} />
        <Legend wrapperStyle={{ fontSize: 10 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CompanyDashboard({ company, allCompanies }: CompanyDashboardProps) {
  const [expandedQuarter, setExpandedQuarter] = useState<string | null>(null);
  const [hoveredQuarter, setHoveredQuarter] = useState<string | null>(null);

  const lineData = company.quarters.map((q) => ({
    quarter: q.id,
    perception: q.brandPerception,
    intensity: q.marketingIntensity,
  }));

  const perceptionAvg =
    allCompanies.reduce((s, c) => s + c.metrics.perceptionAvg, 0) / allCompanies.length;
  const intensityAvg =
    allCompanies.reduce((s, c) => s + c.metrics.intensityAvg, 0) / allCompanies.length;
  const compositeAvg =
    allCompanies.reduce((s, c) => s + c.metrics.composite, 0) / allCompanies.length;

  const donutData = [
    { name: "Events", value: company.channelMix.events, color: "#3b82f6" },
    { name: "Press", value: company.channelMix.pressReleases, color: "#a855f7" },
    { name: "Content", value: company.channelMix.content, color: "#22c55e" },
    { name: "Social", value: company.channelMix.social, color: "#f59e0b" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-4">
          <CompanyLogo company={company} size="lg" />
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground">{company.tagline}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <KpiCard
            label="Perception"
            value={company.metrics.perceptionAvg}
            delta={company.metrics.perceptionAvg - perceptionAvg}
            color={METRIC_CONFIG.perception.color}
          />
          <KpiCard
            label="Intensity"
            value={company.metrics.intensityAvg}
            delta={company.metrics.intensityAvg - intensityAvg}
            color={METRIC_CONFIG.intensity.color}
          />
          <KpiCard
            label="Composite"
            value={company.metrics.composite}
            delta={company.metrics.composite - compositeAvg}
            color="#6366f1"
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium mb-2">Quarterly timeline</p>
          <div
            className="mb-4 p-2 rounded bg-muted/30 min-h-[120px]"
            onMouseLeave={() => setHoveredQuarter(null)}
          >
            <MiniLineChart data={lineData} hoveredQuarter={hoveredQuarter} />
          </div>
          <div className="space-y-2">
            {company.quarters.map((q) => (
              <div
                key={q.id}
                className="rounded border border-border p-3 cursor-pointer"
                onMouseEnter={() => setHoveredQuarter(q.id)}
                onClick={() => setExpandedQuarter(expandedQuarter === q.id ? null : q.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{q.id} – {q.theme}</span>
                  <span className="text-xs text-muted-foreground">
                    P: {q.brandPerception} | I: {q.marketingIntensity}
                  </span>
                </div>
                {expandedQuarter === q.id && (
                  <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside">
                    {q.keyActivities.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="rounded-lg border border-border bg-card p-4 sticky top-4">
          <p className="text-sm font-medium mb-4">Channel mix</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {donutData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
