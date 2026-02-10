"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { computeCompareMetrics, sortCompareMetrics } from "@/lib/compare";
import { useShallow } from "zustand/react/shallow";
import { useCompareStore } from "@/store/use-compare-store";
import { useCompaniesStore } from "@/store/use-companies-store";
import { canonicalToCompanyData } from "@/lib/adapter";
import { CompareStudioHeader } from "@/components/compare/compare-studio-header";
import { CompanyCompareCard } from "@/components/compare/company-compare-card";
import { CompareCharts } from "@/components/compare/compare-charts";
import { CompareTablePro } from "@/components/compare/compare-table-pro";
import { InsightDrawer } from "@/components/compare/insight-drawer";
import { CompareDebugPanel } from "@/components/compare/compare-debug-panel";
import { PremiumSkeleton } from "@/components/ui/premium-skeleton";

function ComparePageContent() {
  const [loaded, setLoaded] = useState(false);
  const [
    viewMode,
    selectedCompanies,
    quarterFocus,
    weights,
    sortMetric,
    normalize,
    activeCompanyFilter,
    hoveredCompany,
    setSortMetric,
    setActiveCompanyFilter,
    setHoveredCompany,
  ] = useCompareStore(
    useShallow((s) => [
      s.viewMode,
      s.selectedCompanies,
      s.quarterFocus,
      s.weights,
      s.sortMetric,
      s.normalize,
      s.activeCompanyFilter,
      s.hoveredCompany,
      s.setSortMetric,
      s.setActiveCompanyFilter,
      s.setHoveredCompany,
    ])
  );

  // useCompareUrlSync(); // Disabled: can cause update loops with useSearchParams

  const companies = useCompaniesStore((s) => s.companies);
  const hydrate = useCompaniesStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const companiesData = useMemo(() => {
    const list = Array.isArray(companies) ? companies : [];
    return list.filter((c) => selectedCompanies.includes(c.slug));
  }, [companies, selectedCompanies]);

  const compareResult = useMemo(() => {
    return computeCompareMetrics(companiesData, quarterFocus, weights, normalize);
  }, [companiesData, quarterFocus, weights, normalize]);

  const metrics = compareResult.metrics;
  const debugInfo = compareResult.debugInfo;

  const sortedMetrics = useMemo(() => {
    return sortCompareMetrics(metrics, sortMetric);
  }, [metrics, sortMetric]);

  const displayedMetrics = useMemo(() => {
    if (activeCompanyFilter) {
      return sortedMetrics.filter((m) => m.id === activeCompanyFilter);
    }
    return sortedMetrics;
  }, [sortedMetrics, activeCompanyFilter]);

  const [drawerCompany, setDrawerCompany] = useState<string | null>(null);
  const selectedCompanyData = useMemo(() => {
    if (!drawerCompany) return null;
    const list = Array.isArray(companies) ? companies : [];
    const c = list.find((x) => x.slug === drawerCompany);
    return c ? canonicalToCompanyData(c) : null;
  }, [drawerCompany, companies]);

  const selectedMetricsForDrawer = useMemo(() => {
    if (!drawerCompany) return null;
    return sortedMetrics.find((c) => c.id === drawerCompany) ?? null;
  }, [drawerCompany, sortedMetrics]);

  const handleCompanySelect = (slug: string) => {
    setDrawerCompany(slug);
  };

  const handleBarClick = (slug: string) => {
    setActiveCompanyFilter(slug);
  };

  const handleSortChange = (metric: string) => {
    setSortMetric(metric as Parameters<typeof setSortMetric>[0]);
  };

  return (
    <div className="space-y-8 pb-12">
      <CompareStudioHeader />

      {!loaded ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <PremiumSkeleton key={i} variant="card" className="h-[220px]" />
            ))}
          </div>
          <div className="space-y-4">
            <PremiumSkeleton variant="chart" className="h-[300px]" />
            <PremiumSkeleton variant="chart" className="h-[280px]" />
          </div>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            {viewMode === "cards" ? (
              <motion.section
                key="cards"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {displayedMetrics.map((m) => (
                  <CompanyCompareCard
                    key={m.id}
                    metrics={m}
                    onClick={() => handleCompanySelect(m.id)}
                  />
                ))}
              </motion.section>
            ) : (
              <motion.section
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CompareTablePro
                  companies={displayedMetrics}
                  onRowClick={handleCompanySelect}
                  sortMetric={sortMetric}
                  onSortChange={handleSortChange}
                  activeCompanyFilter={activeCompanyFilter}
                  hoveredCompany={hoveredCompany}
                  onRowHover={setHoveredCompany}
                />
              </motion.section>
            )}
          </AnimatePresence>

          <section>
            <CompareCharts
              companies={displayedMetrics}
              sortMetric={sortMetric}
              onBarClick={handleBarClick}
              onHoverCompany={setHoveredCompany}
              hoveredCompany={hoveredCompany}
            />
          </section>
        </>
      )}

      <CompareDebugPanel
        companies={sortedMetrics}
        debugInfo={debugInfo}
      />

      <InsightDrawer
        open={drawerCompany !== null}
        onOpenChange={(open) => !open && setDrawerCompany(null)}
        company={selectedCompanyData}
        metrics={selectedMetricsForDrawer}
      />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="space-y-8 pb-12">
        <div className="h-24 rounded-lg bg-muted/40 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <PremiumSkeleton key={i} variant="card" className="h-[220px]" />
          ))}
        </div>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
}
