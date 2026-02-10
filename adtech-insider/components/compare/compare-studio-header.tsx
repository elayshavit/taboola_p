"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { useShallow } from "zustand/react/shallow";
import { motion } from "framer-motion";
import {
  BarChart3,
  LayoutGrid,
  Table2,
  ChevronDown,
  Save,
  FolderOpen,
  Trash2,
  FilterX,
  Plus,
  Download,
} from "lucide-react";
import { useCompareStore } from "@/store/use-compare-store";
import { useCompaniesStore } from "@/store/use-companies-store";
import type { SortMetric } from "@/lib/compare";
import { AddCompanyDialog } from "@/components/compare/add-company-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


const QUARTER_OPTIONS = [
  { value: "all" as const, label: "All" },
  { value: "Q1 2025" as const, label: "Q1" },
  { value: "Q2 2025" as const, label: "Q2" },
  { value: "Q3 2025" as const, label: "Q3" },
  { value: "Q4 2025" as const, label: "Q4" },
];

const METRIC_LABELS: Record<string, string> = {
  brand: "Brand Score",
  innovation: "Innovation",
  presence: "Market Presence",
  activity: "Total Activity",
  peak: "Peak Intensity",
  consistency: "Consistency",
};

const SORT_LABELS: Record<SortMetric, string> = {
  avgBrandScore: "Perception",
  avgIntensity: "Intensity",
  totalActivity: "Activities",
  peakIntensity: "Peak",
  consistency: "Consistency",
  compositeScore: "Composite",
};


function WeightSlider({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: number;
  onValueChange: (v: number) => void;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const n = parseInt(e.target.value, 10);
      if (!Number.isNaN(n) && value !== n) onValueChange(n);
    },
    [value, onValueChange]
  );
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label} ({value}%)</label>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={handleChange}
        className="mt-1 w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted accent-primary"
      />
    </div>
  );
}

const MemoizedWeightSlider = memo(WeightSlider);

function CompareWeightsPanel() {
  const weights = useCompareStore(useShallow((s) => s.weights));
  const setWeights = useCompareStore((s) => s.setWeights);
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
      <p className="text-sm font-medium mb-3">Weighting Scenario (Composite Score)</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["brand", "innovation", "presence", "activity"] as const).map((k) => (
          <MemoizedWeightSlider
            key={k}
            label={METRIC_LABELS[k]}
            value={weights[k]}
            onValueChange={(v) => setWeights({ [k]: v })}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Sum: {Object.values(weights).reduce((a, b) => a + b, 0)}%
      </p>
    </div>
  );
}

export function CompareStudioHeader() {
  const store = useCompareStore();
  const companies = useCompaniesStore((s) => s.companies);
  const exportCompaniesJson = useCompaniesStore((s) => s.exportCompaniesJson);
  const [saveName, setSaveName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const companyList = Array.isArray(companies) ? companies : [];
  const allSlugs = companyList.map((c) => c.slug);
  const companyLabels = Object.fromEntries(companyList.map((c) => [c.slug, c.companyName]));
  const removeCompany = useCompaniesStore((s) => s.removeCompany);

  useEffect(() => {
    useCompareStore.getState().loadSavedViews();
  }, []);

  const companyCount = Math.min(4, Math.max(2, store.selectedCompanies.length));

  const handleViewModeChange = (v: "cards" | "table") => {
    store.setViewMode(v);
    toast.success(`Switched to ${v === "cards" ? "Cards" : "Table Pro"}`);
  };

  const toggleCompany = (slug: string) => {
    const current = store.selectedCompanies;
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    const clamped = next.slice(-4);
    if (clamped.length >= 2) store.setSelectedCompanies(clamped);
  };

  const handleExport = useCallback(() => {
    const json = exportCompaniesJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "adtech-companies.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Companies exported");
  }, [exportCompaniesJson]);

  const toggleQuarter = (q: "all" | "Q1 2025" | "Q2 2025" | "Q3 2025" | "Q4 2025") => {
    const current = Array.isArray(store.quarterFocus)
      ? store.quarterFocus
      : store.quarterFocus === "all"
      ? []
      : [store.quarterFocus];
    let next: typeof store.quarterFocus;
    if (q === "all") next = "all";
    else if (current.includes(q)) {
      const filtered = current.filter((x) => x !== q);
      next = filtered.length === 0 ? "all" : filtered;
    } else {
      const added = [...(current.includes("all") || current.length === 0 ? [] : current), q];
      next = added.length === 4 ? "all" : added;
    }
    store.setQuarterFocus(next);
  };

  const quartersActive = Array.isArray(store.quarterFocus)
    ? store.quarterFocus
    : store.quarterFocus === "all"
    ? []
    : [store.quarterFocus];

  const handleSaveView = () => {
    if (!saveName.trim()) {
      toast.error("Enter a name for the view");
      return;
    }
    store.saveView(saveName.trim());
    setSaveName("");
    setShowSaveInput(false);
    toast.success("View saved");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-primary" />
              Compare Studio
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Executive-grade comparison: companies, quarters, metrics, weights
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="glass-card border-border/60"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Company
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="glass-card border-border/60"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
            {store.activeCompanyFilter && (
              <Button
                variant="outline"
                size="sm"
                className="glass-card border-border/60"
                onClick={() => store.clearFilters()}
              >
                <FilterX className="h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            value={store.viewMode}
            onValueChange={handleViewModeChange}
            options={[
              { value: "cards", label: "Cards", icon: LayoutGrid },
              { value: "table", label: "Table Pro", icon: Table2 },
            ]}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="glass-card border-border/60 min-w-[160px] justify-between">
                Companies ({store.selectedCompanies.length})
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>
                Select 2–4 · Remove to delete from list
              </DropdownMenuLabel>
              {allSlugs.map((slug) => (
                <div
                  key={slug}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent/50 group"
                >
                  <Checkbox
                    checked={store.selectedCompanies.includes(slug)}
                    onCheckedChange={() => toggleCompany(slug)}
                  />
                  <span className="flex-1 truncate text-sm">
                    {companyLabels[slug] ?? slug}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      const wasRemoved = removeCompany(slug);
                      if (wasRemoved) {
                        const updatedCompanies = useCompaniesStore.getState().companies;
                        const updatedSlugs = updatedCompanies.map((c) => c.slug);
                        const nextSelected = store.selectedCompanies.filter(
                          (s) => s !== slug && updatedSlugs.includes(s)
                        );
                        store.setSelectedCompanies(
                          nextSelected.length >= 2 ? nextSelected : updatedSlugs.slice(0, 4)
                        );
                        toast.success(`${companyLabels[slug] ?? slug} removed`);
                      }
                    }}
                    aria-label={`Remove ${companyLabels[slug] ?? slug}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="glass-card border-border/60 min-w-[120px] justify-between">
                Quarters
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {QUARTER_OPTIONS.map((opt) => (
                <DropdownMenuCheckboxItem
                  key={opt.value}
                  checked={opt.value === "all" ? quartersActive.length === 0 : quartersActive.includes(opt.value)}
                  onCheckedChange={() => toggleQuarter(opt.value)}
                >
                  {opt.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="glass-card border-border/60 min-w-[120px] justify-between">
                Sort: {SORT_LABELS[store.sortMetric]}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {Object.entries(SORT_LABELS).map(([key, label]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => store.setSortMetric(key as SortMetric)}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={store.normalize}
                onCheckedChange={(v) => store.setNormalize(!!v)}
              />
              Normalize
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={store.showRanks}
                onCheckedChange={(v) => store.setShowRanks(!!v)}
              />
              Show ranks
            </label>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="glass-card border-border/60">
                <FolderOpen className="h-4 w-4" />
                Saved Views
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {showSaveInput ? (
                <div className="p-2 space-y-2">
                  <input
                    type="text"
                    placeholder="View name"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-border text-sm"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={handleSaveView}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowSaveInput(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <DropdownMenuItem onClick={() => setShowSaveInput(true)}>
                  <Save className="h-4 w-4" />
                  Save current view
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {store.savedViews.length === 0 ? (
                <div className="px-2 py-4 text-sm text-muted-foreground">
                  No saved views
                </div>
              ) : (
                store.savedViews.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-1 group px-2 py-1 rounded hover:bg-muted/50"
                  >
                    <button
                      type="button"
                      className="flex-1 text-left text-sm truncate"
                      onClick={() => store.loadView(v.id)}
                    >
                      {v.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 opacity-60 hover:opacity-100"
                      onClick={() => {
                        store.deleteView(v.id);
                        toast.success("View deleted");
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CompareWeightsPanel />
      </div>

      <AddCompanyDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </motion.header>
  );
}
