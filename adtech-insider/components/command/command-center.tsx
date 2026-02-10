"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";
import { Dialog, VisuallyHidden } from "radix-ui";
import { BarChart3, LayoutGrid, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompaniesStore } from "@/store/use-companies-store";
import { canonicalToCompanyData } from "@/lib/adapter";
import { CompanyLogo } from "@/components/ui/company-logo";
interface CommandCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DeepResult {
  type: "activity" | "theme";
  company: string;
  companySlug: string;
  quarter: string;
  text: string;
  keywords: string[];
}

function buildDeepResults(
  companiesApp: {
    id: string;
    name: string;
    quarterly_data?: { quarter: string; main_theme: string; brand_perception: string; key_activities?: string[] }[];
  }[]
): DeepResult[] {
  const results: DeepResult[] = [];
  for (const c of companiesApp) {
    const qData = c.quarterly_data ?? [];
    for (const q of qData) {
      results.push({
        type: "theme",
        company: c.name,
        companySlug: c.id,
        quarter: q.quarter,
        text: q.main_theme,
        keywords: [q.main_theme, q.brand_perception, c.name],
      });
      for (const act of (q.key_activities ?? []).slice(0, 2)) {
        const short = act.slice(0, 80);
        results.push({
          type: "activity",
          company: c.name,
          companySlug: c.id,
          quarter: q.quarter,
          text: short,
          keywords: [short, q.main_theme, c.name, q.quarter],
        });
      }
    }
  }
  return results;
}

export function CommandCenter({ open, onOpenChange }: CommandCenterProps) {
  const companies = useCompaniesStore((s) => s.companies);
  const companiesApp = useMemo(() => {
    if (!Array.isArray(companies)) return [];
    try {
      return companies.map(canonicalToCompanyData);
    } catch {
      return [];
    }
  }, [companies]);
  const deepResults = useMemo(() => buildDeepResults(companiesApp), [companiesApp]);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command center"
      overlayClassName="bg-black/50 backdrop-blur-sm"
      contentClassName={cn(
        "rounded-2xl border border-border/60",
        "bg-background/95 backdrop-blur-xl",
        "shadow-2xl",
        "p-0 overflow-hidden"
      )}
    >
      <VisuallyHidden.Root asChild>
        <Dialog.Title>Command center</Dialog.Title>
      </VisuallyHidden.Root>
      <CommandInput
        placeholder="Search companies, pages, themes, events..."
        className="h-12 border-b border-border/60 px-4 text-base placeholder:text-muted-foreground"
      />
      <CommandList className="max-h-[400px] p-2">
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Companies">
          {companiesApp.map((c) => (
              <CommandItem
                key={c.id}
                value={`${c.name} ${c.tagline} company`}
                keywords={[c.name, c.tagline]}
                onSelect={() => handleSelect(`/company/${c.id}`)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer"
              >
                <CompanyLogo
                  slug={c.id}
                  name={c.name}
                  size="sidebar"
                  variant="avatar"
                  className="rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground text-sm ml-1 truncate block">
                    {c.tagline}
                  </span>
                </div>
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                  ↵
                </kbd>
              </CommandItem>
            ))}
        </CommandGroup>

        <CommandGroup heading="Pages">
          <CommandItem
            value="analyze any company"
            keywords={["analyze", "analysis", "ai", "company"]}
            onSelect={() => handleSelect("/")}
            className="flex items-center gap-3 rounded-lg px-3 py-2"
          >
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <span>Analyze any company</span>
            <kbd className="hidden sm:inline-flex ml-auto h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              ↵
            </kbd>
          </CommandItem>
          <CommandItem
            value="compare all comparison"
            keywords={["compare", "comparison"]}
            onSelect={() => handleSelect("/compare")}
            className="flex items-center gap-3 rounded-lg px-3 py-2"
          >
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            <span>Compare All</span>
            <kbd className="hidden sm:inline-flex ml-auto h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              ↵
            </kbd>
          </CommandItem>
          <CommandItem
            value="dashboard home"
            keywords={["dashboard", "home"]}
            onSelect={() => handleSelect("/")}
            className="flex items-center gap-3 rounded-lg px-3 py-2"
          >
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span>Dashboard</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Deep search — Themes & events">
          {deepResults.map((r, i) => (
            <CommandItem
              key={`deep-${r.companySlug}-${r.quarter}-${i}-${r.text.slice(0, 20)}`}
              value={r.text}
              keywords={r.keywords}
              onSelect={() => handleSelect(`/company/${r.companySlug}`)}
              className="flex items-start gap-3 rounded-lg px-3 py-2"
            >
              <Sparkles className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{r.text}</p>
                <p className="text-xs text-muted-foreground">
                  {r.company} · {r.quarter}
                </p>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      <div className="border-t border-border/60 px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground">
        <kbd className="rounded border border-border bg-muted px-1.5 font-mono">
          ⌘K
        </kbd>
        <span>to open</span>
      </div>
    </CommandDialog>
  );
}
