"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  Target,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanyData } from "@/types";

interface EnrichedSectionsProps {
  company: CompanyData;
  className?: string;
}

export const EnrichedSections = memo(function EnrichedSections({
  company,
  className,
}: EnrichedSectionsProps) {
  const e = company.enrichment;
  if (!e) return null;

  const hasContent =
    (e.highlights_extended?.length ?? 0) > 0 ||
    (e.risks_extended?.length ?? 0) > 0 ||
    (e.initiatives_extended?.length ?? 0) > 0 ||
    (e.faq?.length ?? 0) > 0;

  if (!hasContent) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}
    >
      {e.highlights_extended && e.highlights_extended.length > 0 && (
        <section className="rounded-xl glass-card p-4 border border-border/60">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-semibold">Highlights</h3>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {e.highlights_extended.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-500/80">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {e.risks_extended && e.risks_extended.length > 0 && (
        <section className="rounded-xl glass-card p-4 border border-border/60">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Risks</h3>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {e.risks_extended.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-500/80">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {e.initiatives_extended && e.initiatives_extended.length > 0 && (
        <section className="rounded-xl glass-card p-4 border border-border/60">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Initiatives</h3>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {e.initiatives_extended.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary/80">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {e.faq && e.faq.length > 0 && (
        <section className="rounded-xl glass-card p-4 border border-border/60 md:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">FAQ</h3>
          </div>
          <dl className="space-y-3">
            {e.faq.map((item, i) => (
              <div key={i} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <dt className="text-sm font-medium text-foreground mb-1">
                  {item.q}
                </dt>
                <dd className="text-sm text-muted-foreground pl-4">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </motion.div>
  );
});
