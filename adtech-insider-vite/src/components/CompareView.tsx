import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import type { Company } from "@/types/company";
import { METRIC_CONFIG, getMetricValue, type MetricKey } from "@/config/metrics";
import { normalizeScores } from "@/lib/normalizeScores";

interface CompareViewProps {
  companies: Company[];
}

const METRIC_KEYS: MetricKey[] = ["activity", "intensity", "peak", "perception"];

export function CompareView({ companies }: CompareViewProps) {
  const navigate = useNavigate();

  const barData = companies.map((c) => {
    const raw = METRIC_KEYS.reduce(
      (acc, k) => ({ ...acc, [k]: getMetricValue(c, k) }),
      {} as Record<string, number>
    );
    const activityValues = companies.map((x) => getMetricValue(x, "activity"));
    const intensityValues = companies.map((x) => getMetricValue(x, "intensity"));
    const peakValues = companies.map((x) => getMetricValue(x, "peak"));
    const perceptionValues = companies.map((x) => getMetricValue(x, "perception"));

    const normActivity = normalizeScores(activityValues)[companies.indexOf(c)] ?? 50;
    const normIntensity = normalizeScores(intensityValues)[companies.indexOf(c)] ?? 50;
    const normPeak = normalizeScores(peakValues)[companies.indexOf(c)] ?? 50;
    const normPerception = normalizeScores(perceptionValues)[companies.indexOf(c)] ?? 50;

    return {
      company: c.name,
      id: c.id,
      activity: normActivity,
      intensity: normIntensity,
      peak: normPeak,
      perception: normPerception,
      raw,
      confidence: c.metrics.confidence,
    };
  });

  const rankedByPerception = [...companies].sort(
    (a, b) => b.metrics.perceptionAvg - a.metrics.perceptionAvg
  );
  const perceptionValues = rankedByPerception.map((c) => c.metrics.perceptionAvg);
  const normPerception = normalizeScores(perceptionValues);
  const rankedData = rankedByPerception.map((c, i) => ({
    name: c.name,
    id: c.id,
    perception: c.metrics.perceptionAvg,
    normalized: normPerception[i] ?? 50,
    confidence: c.metrics.confidence,
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Compare Companies</h1>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Normalized metrics</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Activity (blue), Intensity (purple), Peak (green), Perception (teal). Click a bar to navigate.
        </p>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="company" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  if (!d) return null;
                  return (
                    <div className="rounded border bg-background p-3 text-sm shadow-lg">
                      <p className="font-medium">{d.company}</p>
                      {METRIC_KEYS.map((k) => (
                        <p key={k}>
                          {METRIC_CONFIG[k].label}: {d[k]?.toFixed(1) ?? 0} (raw: {d.raw?.[k] ?? 0})
                        </p>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend />
              <Bar dataKey="activity" name="Activity" fill={METRIC_CONFIG.activity.color} radius={[2, 2, 0, 0]} onClick={(d) => d?.id && navigate(`/company/${d.id}`)} cursor="pointer" />
              <Bar dataKey="intensity" name="Intensity" fill={METRIC_CONFIG.intensity.color} radius={[2, 2, 0, 0]} onClick={(d) => d?.id && navigate(`/company/${d.id}`)} cursor="pointer" />
              <Bar dataKey="peak" name="Peak" fill={METRIC_CONFIG.peak.color} radius={[2, 2, 0, 0]} onClick={(d) => d?.id && navigate(`/company/${d.id}`)} cursor="pointer" />
              <Bar dataKey="perception" name="Perception" fill={METRIC_CONFIG.perception.color} radius={[2, 2, 0, 0]} onClick={(d) => d?.id && navigate(`/company/${d.id}`)} cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Ranked by perception</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Color intensity reflects confidence. Low confidence = muted.
        </p>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rankedData} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  if (!d) return null;
                  return (
                    <div className="rounded border bg-background p-3 text-sm shadow-lg">
                      <p className="font-medium">{d.name}</p>
                      <p>Raw perception: {d.perception}</p>
                      <p>Normalized: {d.normalized?.toFixed(1)}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="normalized" name="Perception (0-100)" radius={[0, 4, 4, 0]}>
                {rankedData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.confidence < 70 ? "#94a3b8" : METRIC_CONFIG.perception.color}
                    fillOpacity={entry.confidence < 70 ? 0.6 : 1}
                    style={entry.confidence < 70 ? { stroke: "#64748b", strokeDasharray: "4 2" } : undefined}
                    onClick={() => navigate(`/company/${entry.id}`)}
                    cursor="pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
