"use client";

import { motion } from "framer-motion";
import { BarChart3, LayoutGrid, Table2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";
import type { QuarterFocus, SortMetric } from "@/lib/compare";

export type ViewMode = "cards" | "table";

const SORT_OPTIONS: { value: SortMetric; label: string }[] = [
  { value: "avgBrandScore", label: "Perception Score" },
  { value: "avgIntensity", label: "Marketing Intensity" },
  { value: "totalActivity", label: "Total Activities" },
  { value: "peakIntensity", label: "Peak Intensity" },
  { value: "consistency", label: "Consistency" },
];

const QUARTER_OPTIONS: { value: QuarterFocus; label: string }[] = [
  { value: "all", label: "All Quarters" },
  { value: "Q1 2025", label: "Q1 2025" },
  { value: "Q2 2025", label: "Q2 2025" },
  { value: "Q3 2025", label: "Q3 2025" },
  { value: "Q4 2025", label: "Q4 2025" },
];

interface CompareHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  sortBy: SortMetric;
  onSortChange: (v: SortMetric) => void;
  quarterFocus: QuarterFocus;
  onQuarterChange: (v: QuarterFocus) => void;
}

export function CompareHeader({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  quarterFocus,
  onQuarterChange,
}: CompareHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            Compare All
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Side-by-side analysis of AdTech company performance and marketing
            intensity
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            value={viewMode}
            onValueChange={onViewModeChange}
            options={[
              { value: "cards", label: "Cards", icon: LayoutGrid },
              { value: "table", label: "Table Pro", icon: Table2 },
            ]}
          />
          <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortMetric)}>
            <SelectTrigger className="w-[180px] glass-card border-border/60">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={quarterFocus}
            onValueChange={(v) => onQuarterChange(v as QuarterFocus)}
          >
            <SelectTrigger className="w-[140px] glass-card border-border/60">
              <SelectValue placeholder="Quarter" />
            </SelectTrigger>
            <SelectContent>
              {QUARTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.header>
  );
}
