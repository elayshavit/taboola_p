"use client";

import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCompanyBrand } from "@/config/brand";
import type { CompanyData, QuarterlyData, CompanySlug } from "@/types";

interface QuarterTimelineProps {
  company: CompanyData;
}

function QuarterCard({
  data,
  isExpanded,
  isActive,
  onToggle,
  accentColor,
}: {
  data: QuarterlyData;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
  accentColor: string;
}) {
  const activityCount = data.key_activities?.length ?? 0;

  return (
    <motion.div
      layout
      className={cn(
        "rounded-xl overflow-hidden",
        "border transition-colors duration-200",
        isActive
          ? "border-[var(--glass-border)]"
          : "border-transparent hover:border-[var(--glass-border)]"
      )}
      initial={false}
    >
      <motion.button
        layout
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between p-4 text-left",
          "glass-card rounded-xl",
          "hover:bg-muted/20 transition-colors"
        )}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold",
              "transition-colors"
            )}
            style={{
              background: isActive ? `${accentColor}25` : "var(--muted)",
              color: isActive ? accentColor : "var(--muted-foreground)",
            }}
          >
            {data.quarter.replace(" 2025", "").replace("Q", "")}
          </div>
          <div>
            <span className="text-sm font-semibold block">{data.quarter}</span>
            <span className="text-muted-foreground text-xs">{data.main_theme}</span>
          </div>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${accentColor}20`,
              color: accentColor,
            }}
          >
            {activityCount} activities
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className="border-t border-border/60 px-4 pb-4 pt-3 ml-4 pl-6 relative"
              style={{
                borderLeft: `2px solid ${accentColor}50`,
              }}
            >
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <ListChecks className="h-3.5 w-3.5" style={{ color: accentColor }} />
                Key Activities
              </h4>
              <ul className="space-y-3">
                {(data.key_activities ?? []).map((activity, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.2 }}
                    className="text-sm pl-3 border-l-2 py-1"
                    style={{ borderLeftColor: `${accentColor}40` }}
                  >
                    <span className="text-foreground/90">{activity}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export const QuarterTimeline = memo(function QuarterTimeline({
  company,
}: QuarterTimelineProps) {
  const quarterlyData = company.quarterly_data ?? [];
  const brand = getCompanyBrand(company.id as CompanySlug);
  const [expandedQuarter, setExpandedQuarter] = useState<string | null>(
    quarterlyData[0]?.quarter ?? null
  );

  if (quarterlyData.length === 0) {
    return (
      <div className="rounded-xl glass-card p-6 text-center text-muted-foreground">
        No quarterly data available.
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Quarterly Timeline</h2>
      </div>

      <div className="relative">
        {/* Vertical progress line (gradient) */}
        <div
          className="absolute left-5 top-6 bottom-6 w-0.5 rounded-full opacity-30"
          style={{
            background: `linear-gradient(180deg, ${brand.accent}80, ${brand.accent}20)`,
          }}
          aria-hidden
        />

        <div className="space-y-2 relative">
          {quarterlyData.map((q) => (
            <QuarterCard
              key={q.quarter}
              data={q}
              isExpanded={expandedQuarter === q.quarter}
              isActive={expandedQuarter === q.quarter}
              onToggle={() =>
                setExpandedQuarter((prev) =>
                  prev === q.quarter ? null : q.quarter
                )
              }
              accentColor={brand.accent}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
});
