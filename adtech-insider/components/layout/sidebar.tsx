"use client";

import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, BarChart3, PanelLeftClose, PanelLeft, Search, Sparkles, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getCompanyBrand } from "@/config/brand";
import { CompanyLogo } from "@/components/ui/company-logo";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyStore } from "@/store/use-company-store";
import { useCompaniesStore } from "@/store/use-companies-store";

function SidebarSkeleton({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
          {!collapsed && <Skeleton className="h-4 flex-1 rounded" />}
        </div>
      ))}
    </div>
  );
}

function SidebarNav({
  onNavigate,
  collapsed,
  onCommandOpen,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  onCommandOpen?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const setSelectedCompany = useCompanyStore((s) => s.setSelectedCompany);
  const companies = useCompaniesStore((s) => s.companies);
  const removeCompany = useCompaniesStore((s) => s.removeCompany);
  const navItems = useMemo(() => {
    const list = Array.isArray(companies) ? companies : [];
    if (list.length === 0) return [{ slug: "compare" as const, label: "Compare All" }];
    return [
      ...list.map((c) => ({ slug: c.slug, label: c.companyName })),
      { slug: "compare" as const, label: "Compare All" },
    ];
  }, [companies]);

  const showSkeleton = !Array.isArray(companies) || companies.length === 0;

  const handleClick = (slug: string) => {
    if (slug !== "compare") {
      setSelectedCompany(slug);
    } else {
      setSelectedCompany(null);
    }
    onNavigate?.();
  };

  return (
    <nav className="flex flex-col gap-1">
      {onCommandOpen && (
        <button
          type="button"
          onClick={onCommandOpen}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
            "text-muted-foreground hover:bg-sidebar-accent/80 hover:text-foreground"
          )}
        >
          <div className="h-8 w-8 shrink-0 rounded-lg bg-muted flex items-center justify-center">
            <Search className="h-4 w-4" />
          </div>
          {!collapsed && (
            <span className="flex-1 flex items-center justify-between">
              Search
              <kbd className="rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </span>
          )}
        </button>
      )}
      <Link
        href="/"
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200",
          pathname === "/"
            ? "bg-sidebar-accent text-foreground"
            : "text-muted-foreground hover:bg-sidebar-accent/80 hover:text-foreground"
        )}
      >
        <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        {!collapsed && <span>Analyze company</span>}
      </Link>
      {showSkeleton ? (
        <SidebarSkeleton collapsed={collapsed} />
      ) : null}
      {navItems.map((item) => {
        const isCompare = item.slug === "compare";
        const isActive = isCompare
          ? pathname === "/compare"
          : pathname === `/company/${item.slug}`;

        const brand = !isCompare ? getCompanyBrand(item.slug) : null;

        const href = isCompare ? "/compare" : `/company/${item.slug}`;

        const handleRemove = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (removeCompany(item.slug)) {
            if (pathname === `/company/${item.slug}`) {
              router.push("/");
            }
            onNavigate?.();
          }
        };

        return (
          <div
            key={item.slug}
            className={cn(
              "group flex w-full items-center gap-1 rounded-xl text-sm font-medium transition-all duration-200",
              "hover:bg-sidebar-accent/80"
            )}
          >
            <Link
              href={href}
              prefetch={false}
              onClick={() => handleClick(item.slug)}
              className={cn(
                "flex flex-1 min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left",
                isActive && brand
                  ? "bg-gradient-to-r from-[var(--sidebar-accent)] shadow-sm"
                  : "",
                isActive && !brand ? "bg-sidebar-accent" : "",
                !isActive ? "text-muted-foreground hover:text-foreground" : "text-foreground"
              )}
              style={
                isActive && brand
                  ? {
                      borderLeft: `3px solid ${brand.accent}`,
                      boxShadow: `inset 0 0 0 1px ${brand.accent}20`,
                    }
                  : isActive
                  ? { borderLeft: "3px solid var(--primary)" }
                  : {}
              }
            >
              {!isCompare && brand ? (
                <CompanyLogo
                  slug={item.slug}
                  name={item.label}
                  size="sidebar"
                  variant="avatar"
                  className="rounded-lg"
                />
              ) : isCompare ? (
                <div className="h-8 w-8 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
              ) : (
                <div className="h-8 w-8 shrink-0 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">
                  {item.label.charAt(0)}
                </div>
              )}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
            {!isCompare && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 shrink-0 opacity-50 hover:opacity-100 transition-opacity",
                  collapsed && "opacity-100"
                )}
                onClick={handleRemove}
                aria-label={`Remove ${item.label} from list`}
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </Button>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar({
  onCommandOpen,
}: {
  onCommandOpen?: () => void;
} = {}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        className="hidden md:flex flex-col border-r border-border/60 glass-card sticky top-0 h-screen shrink-0"
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-3 border-b border-border/60 flex items-center justify-between min-h-[57px] gap-2">
          <Link
            href="/company/taboola"
            className={cn(
              "flex items-center gap-2 min-w-0 overflow-hidden",
              collapsed && "justify-center"
            )}
          >
            <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-foreground truncate">
                AdTech Insider
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <SidebarNav collapsed={collapsed} onCommandOpen={onCommandOpen} />
        </div>
      </motion.aside>

      {/* Mobile: Sheet drawer */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-xl glass-card">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-72 rounded-r-xl glass-card border-l"
          >
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                AdTech Insider
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <SidebarNav
                onNavigate={() => setMobileOpen(false)}
                onCommandOpen={() => {
                  onCommandOpen?.();
                  setMobileOpen(false);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
