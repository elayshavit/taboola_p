"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCompaniesStore } from "@/store/use-companies-store";
import { canonicalToCompanyData } from "@/lib/adapter";
import {
  analyzeResponseToCompanyData,
  type AnalyzeApiResponse,
  isValidLogoUrl,
} from "@/lib/analyze-adapter";
import {
  getStaticCompanyData,
  isStaticCompany,
  resolveSlug,
} from "@/lib/static-loader";
import type { CompanyData } from "@/types";
import { HeroHeader } from "@/components/dashboard/hero-header";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { EnrichedSections } from "@/components/dashboard/enriched-sections";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const QuarterTimeline = dynamic(
  () =>
    import("@/components/dashboard/quarter-timeline").then((m) => ({
      default: m.QuarterTimeline,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    ),
  }
);

const BubbleChart = dynamic(
  () =>
    import("@/components/dashboard/bubble-chart").then((m) => ({
      default: m.BubbleChart,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[340px] w-full rounded-xl" />,
  }
);

function slugToDisplayName(slug: string): string {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(" ");
}

function addAnalyzedCompanyToStore(
  slug: string,
  companyData: CompanyData,
  logoSrc?: string | null
) {
  try {
    const store = useCompaniesStore.getState();

    // Persist as InputCompany JSON so it becomes part of the global dataset,
    // sidebar navigation, compare view, and command palette.
    const inputCompany = {
      id: slug,
      name: companyData.name,
      tagline: companyData.tagline,
      overview: companyData.overview,
      strategy_2025_summary: companyData.strategy_2025_summary,
      offerings: companyData.offerings,
      quarterly_data: companyData.quarterly_data,
      logo: logoSrc ?? null,
    };

    store.addCompanies([inputCompany]);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn(
        "[CompanyPageClient] Failed to persist analyzed company",
        err
      );
    }
  }
}

function AnalyzeLoading({ companyName }: { companyName: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Analyzing {companyName}...</h2>
        <p className="text-muted-foreground text-sm max-w-md text-center">
          Searching for 2025 marketing strategy, news, and campaigns. Our AI is
          structuring the data for you.
        </p>
      </div>
      <div className="flex gap-2">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:150ms]" />
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function AnalyzeError({
  slug,
  error,
}: {
  slug: string;
  error: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h1 className="text-2xl font-bold">Analysis failed</h1>
      <p className="text-muted-foreground text-center max-w-md">{error}</p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="rounded bg-primary text-primary-foreground px-4 py-2 text-sm"
        >
          Try another company
        </Link>
        <Link
          href="/company/taboola"
          className="rounded border border-border px-4 py-2 text-sm"
        >
          Browse pre-loaded companies
        </Link>
      </div>
    </div>
  );
}

export function CompanyPageClient() {
  const params = useParams();
  const slug = decodeURIComponent((params?.slug as string) ?? "").trim();
  const companies = useCompaniesStore((s) => s.companies);
  const [analyzeState, setAnalyzeState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: CompanyData; logoSrc?: string }
    | { status: "error"; message: string }
  >({ status: "idle" });

  const resolvedSlug = resolveSlug(slug);
  const company = companies?.find(
    (c) =>
      c.slug === slug ||
      c.id === slug ||
      c.slug === resolvedSlug ||
      c.id === resolvedSlug
  );

  useEffect(() => {
    if (company || !slug || isStaticCompany(slug)) return;
    setAnalyzeState({ status: "loading" });
    const companyName = slugToDisplayName(slug);
    const controller = new AbortController();

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName }),
      signal: controller.signal,
    })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          let msg: string;
          try {
            const parsed = JSON.parse(text) as { error?: string };
            msg = parsed?.error ?? `HTTP ${res.status}`;
          } catch {
            msg = `HTTP ${res.status}`;
          }
          setAnalyzeState({ status: "error", message: msg });
          return;
        }
        let data: AnalyzeApiResponse & { error?: string };
        try {
          data = JSON.parse(text) as AnalyzeApiResponse & { error?: string };
        } catch {
          setAnalyzeState({
            status: "error",
            message: "Invalid response from server",
          });
          return;
        }
        if (controller.signal.aborted) return;
        if (data?.error) {
          setAnalyzeState({ status: "error", message: data.error });
          return;
        }
        try {
          const companyData = analyzeResponseToCompanyData(slug, data);
          const logoUrl = isValidLogoUrl(data.company?.logoUrl);
          const enrichedCompany: CompanyData = {
            ...companyData,
            logoUrl: logoUrl ?? undefined,
          };

          addAnalyzedCompanyToStore(slug, enrichedCompany, logoUrl);

          setAnalyzeState({
            status: "success",
            data: enrichedCompany,
            logoSrc: logoUrl ?? undefined,
          });
        } catch (parseErr) {
          setAnalyzeState({
            status: "error",
            message:
              parseErr instanceof Error ? parseErr.message : "Failed to process analysis",
          });
        }
      })
      .catch((err) => {
        if (controller.signal.aborted || err?.name === "AbortError") return;
        setAnalyzeState({
          status: "error",
          message: err?.message ?? "Network or server error",
        });
      });

    return () => controller.abort();
  }, [slug, company]);

  if (slug && isStaticCompany(slug)) {
    const staticStart = typeof performance !== "undefined" ? performance.now() : 0;
    const staticData = getStaticCompanyData(slug);
    if (staticData) {
      if (process.env.NODE_ENV === "development" && typeof performance !== "undefined") {
        // eslint-disable-next-line no-console
        console.log(`[perf] static company above-the-fold ${slug} in ${(performance.now() - staticStart).toFixed(1)}ms`);
      }
      return (
        <div className="space-y-6">
          <HeroHeader company={staticData} logoSrc={undefined} />
          <KpiGrid company={staticData} />
          <EnrichedSections company={staticData} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <QuarterTimeline company={staticData} />
            </div>
            <div>
              <BubbleChart company={staticData} />
            </div>
          </div>
        </div>
      );
    }
  }

  if (company) {
    const companyData = canonicalToCompanyData(company);
    return (
      <div className="space-y-6">
        <HeroHeader company={companyData} logoSrc={company.logo} />
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

  if (analyzeState.status === "loading") {
    return <AnalyzeLoading companyName={slugToDisplayName(slug)} />;
  }

  if (analyzeState.status === "error") {
    return (
      <AnalyzeError slug={slug} error={analyzeState.message} />
    );
  }

  if (analyzeState.status === "success") {
    const { data: companyData, logoSrc } = analyzeState;
    return (
      <div className="space-y-6">
        <HeroHeader company={companyData} logoSrc={logoSrc} />
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

  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h1 className="text-2xl font-bold">Company not found</h1>
        <Link href="/" className="rounded bg-primary text-primary-foreground px-4 py-2 text-sm">
          Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h1 className="text-2xl font-bold">Company not found</h1>
      <p className="text-muted-foreground">
        No company with slug &quot;{slug}&quot; was found.
      </p>
      <div className="flex gap-4">
        <Link href="/compare" className="rounded bg-primary text-primary-foreground px-4 py-2 text-sm">
          Compare All
        </Link>
        <Link href="/" className="rounded border border-border px-4 py-2 text-sm">
          Home
        </Link>
      </div>
    </div>
  );
}
