"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCompaniesStore } from "@/store/use-companies-store";
import { canonicalToCompanyData } from "@/lib/adapter";
import { HeroHeader } from "@/components/dashboard/hero-header";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { QuarterTimeline } from "@/components/dashboard/quarter-timeline";
import { BubbleChart } from "@/components/dashboard/bubble-chart";

export function CompanyPageClient() {
  const params = useParams();
  const slug = (params?.slug as string) ?? "";
  const companies = useCompaniesStore((s) => s.companies);

  useEffect(() => {
    useCompaniesStore.getState().hydrate();
  }, []);

  const company = companies?.find(
    (c) => c.slug === slug || c.id === slug
  );

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h1 className="text-2xl font-bold">Company not found</h1>
        <p className="text-muted-foreground">
          No company with slug &quot;{slug}&quot; was found.
        </p>
        <div className="flex gap-4">
          <Link
            href="/compare"
            className="rounded bg-primary text-primary-foreground px-4 py-2 text-sm"
          >
            Compare All
          </Link>
          <Link
            href="/"
            className="rounded border border-border px-4 py-2 text-sm"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  const companyData = canonicalToCompanyData(company);

  return (
    <div className="space-y-6">
      <HeroHeader company={companyData} />
      <KpiGrid company={companyData} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuarterTimeline company={companyData} />
        </div>
        <div>
          <BubbleChart company={companyData} />
        </div>
      </div>
    </div>
  );
}
