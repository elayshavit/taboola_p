"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnMeta,
} from "@tanstack/react-table";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, Columns3, Crown, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CompanyLogo } from "@/components/ui/company-logo";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";
import { getCompanyBrand } from "@/config/brand";
import type { CompanyCompareMetrics } from "@/lib/compare";
type Density = "compact" | "comfortable";

interface CompareTableProProps {
  companies: CompanyCompareMetrics[];
  onRowClick: (slug: string) => void;
  sortMetric?: string;
  onSortChange?: (metric: string) => void;
  activeCompanyFilter?: string | null;
  hoveredCompany?: string | null;
  onRowHover?: (slug: string | null) => void;
}

const COLUMNS = [
  { id: "company", label: "Company", hideable: false },
  { id: "avgBrandScore", label: "Perception", hideable: true },
  { id: "avgIntensity", label: "Intensity", hideable: true },
  { id: "totalActivity", label: "Activities", hideable: true },
  { id: "peakIntensity", label: "Peak", hideable: true },
  { id: "consistency", label: "Consistency", hideable: true },
  { id: "compositeScore", label: "Composite", hideable: true },
] as const;

function formatValue(value: unknown): string {
  if (typeof value === "number") return value.toFixed(1);
  return String(value ?? "");
}

function exportToCSV(companies: CompanyCompareMetrics[]) {
  const headers = ["Company", "Perception", "Intensity", "Activities", "Peak", "Consistency", "Composite"];
  const rows = companies.map((c) => [
    c.name,
    c.avgBrandScore,
    c.avgIntensity,
    c.totalActivity,
    c.peakIntensity,
    c.consistency,
    c.compositeScore,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "compare-export.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const SORT_ID_MAP: Record<string, string> = {
  avgBrandScore: "avgBrandScore",
  avgIntensity: "avgIntensity",
  totalActivity: "totalActivity",
  peakIntensity: "peakIntensity",
  consistency: "consistency",
  compositeScore: "compositeScore",
};

export function CompareTablePro({
  companies,
  onRowClick,
  sortMetric = "avgBrandScore",
  onSortChange,
  activeCompanyFilter,
  hoveredCompany,
  onRowHover,
}: CompareTableProProps) {
  const sortId = SORT_ID_MAP[sortMetric] ?? sortMetric;
  const [sorting, setSorting] = useState<SortingState>([
    { id: sortId, desc: true },
  ]);
  useEffect(() => {
    setSorting([{ id: sortId, desc: true }]);
  }, [sortId]);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [density, setDensity] = useState<Density>("comfortable");

  const columnHelper = createColumnHelper<CompanyCompareMetrics>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        id: "company",
        header: "Company",
        cell: ({ row }) => {
          const m = row.original;
          const isBest =
            m.rankAvgBrandScore === 1 ||
            m.rankAvgIntensity === 1 ||
            m.rankTotalActivity === 1;
          return (
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => onRowClick(m.id)}
            >
              <CompanyLogo slug={m.id} name={m.name} size="sm" variant="avatar" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{m.name}</span>
                  {isBest && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                </div>
                <span className="text-xs text-muted-foreground truncate block max-w-[160px]">
                  {m.tagline}
                </span>
              </div>
            </div>
          );
        },
        meta: { hideable: false },
      }),
      columnHelper.accessor("avgBrandScore", {
        id: "avgBrandScore",
        header: "Perception",
        cell: ({ row, getValue }) => {
          const rank = row.original.rankAvgBrandScore;
          const isBest = rank === 1;
          return (
            <div className="flex items-center gap-2">
              <span>{formatValue(getValue())}</span>
              {isBest && (
                <Badge variant="secondary" className="text-[10px] px-1">
                  #1
                </Badge>
              )}
            </div>
          );
        },
        meta: { hideable: true },
      }),
      columnHelper.accessor("avgIntensity", {
        id: "avgIntensity",
        header: "Intensity",
        cell: ({ row, getValue }) => {
          const isBest = row.original.rankAvgIntensity === 1;
          return (
            <div className="flex items-center gap-2">
              <span>{formatValue(getValue())}</span>
              {isBest && (
                <Badge variant="secondary" className="text-[10px] px-1">
                  #1
                </Badge>
              )}
            </div>
          );
        },
        meta: { hideable: true },
      }),
      columnHelper.accessor("totalActivity", {
        id: "totalActivity",
        header: "Activities",
        cell: ({ row, getValue }) => {
          const isBest = row.original.rankTotalActivity === 1;
          return (
            <div className="flex items-center gap-2">
              <span>{formatValue(getValue())}</span>
              {isBest && (
                <Badge variant="secondary" className="text-[10px] px-1">
                  #1
                </Badge>
              )}
            </div>
          );
        },
        meta: { hideable: true },
      }),
      columnHelper.accessor("peakIntensity", {
        id: "peakIntensity",
        header: "Peak",
        cell: ({ row, getValue }) => {
          const isBest = row.original.rankPeakIntensity === 1;
          return (
            <div className="flex items-center gap-2">
              <span>{formatValue(getValue())}</span>
              {isBest && (
                <Badge variant="secondary" className="text-[10px] px-1">
                  #1
                </Badge>
              )}
            </div>
          );
        },
        meta: { hideable: true },
      }),
      columnHelper.accessor("consistency", {
        id: "consistency",
        header: "Consistency",
        cell: ({ row, getValue }) => {
          const isBest = row.original.rankConsistency === 1;
          return (
            <div className="flex items-center gap-2">
              <span>{formatValue(getValue())}</span>
              {isBest && (
                <Badge variant="secondary" className="text-[10px] px-1">
                  #1
                </Badge>
              )}
            </div>
          );
        },
        meta: { hideable: true },
      }),
      columnHelper.accessor("compositeScore", {
        id: "compositeScore",
        header: "Composite",
        cell: ({ row, getValue }) => {
          const isBest = row.original.rankCompositeScore === 1;
          return (
            <div className="flex items-center gap-2">
              <span>{formatValue(getValue())}</span>
              {isBest && (
                <Badge variant="secondary" className="text-[10px] px-1">
                  #1
                </Badge>
              )}
            </div>
          );
        },
        meta: { hideable: true },
      }),
    ],
    [onRowClick]
  );

  const table = useReactTable({
    data: companies,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="glass-card border-border/60">
              <Columns3 className="h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {table
              .getAllColumns()
              .filter((col) => (col.columnDef.meta as ColumnMeta<CompanyCompareMetrics, unknown> & { hideable?: boolean })?.hideable)
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(v) => col.toggleVisibility(!!v)}
                >
                  {col.columnDef.header as string}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <SegmentedControl
          value={density}
          onValueChange={(v) => setDensity(v as Density)}
          options={[
            { value: "compact", label: "Compact" },
            { value: "comfortable", label: "Comfortable" },
          ]}
          size="sm"
        />
        <Button
          variant="outline"
          size="sm"
          className="glass-card border-border/60"
          onClick={() => {
            exportToCSV(companies);
            toast.success("Export completed");
          }}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden glass-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.id === "company" && "sticky left-0 z-10 bg-background/95 backdrop-blur"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {header.column.getCanSort() && header.id !== "company" ? (
                        <button
                          type="button"
                          className="flex items-center gap-1 hover:text-foreground"
                          onClick={() => {
                            const next = header.column.getIsSorted() === "asc" ? "desc" : "asc";
                            header.column.toggleSorting(next === "asc");
                            onSortChange?.(header.id);
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              const slug = row.original.id;
              const isFocused = activeCompanyFilter === slug;
              const isHovered = hoveredCompany === slug;
              return (
              <TableRow
                key={row.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  isFocused && "bg-primary/10 ring-1 ring-primary/30",
                  isHovered && "bg-muted/60"
                )}
                onClick={() => onRowClick(slug)}
                onMouseEnter={() => onRowHover?.(slug)}
                onMouseLeave={() => onRowHover?.(null)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      density === "compact" && "py-2",
                      cell.column.id === "company" &&
                        "sticky left-0 z-10 bg-background/95 backdrop-blur"
                    )}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
