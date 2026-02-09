"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getCompanyBrand } from "@/config/brand";
import type { CompanySlug } from "@/types";

interface CompanyMarkProps {
  slug: CompanySlug;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-14 w-14 text-2xl",
};

export function CompanyMark({
  slug,
  name,
  size = "md",
  className,
}: CompanyMarkProps) {
  const brand = getCompanyBrand(slug);
  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center font-bold text-white shrink-0",
        sizeClasses[size],
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${brand.gradientFrom}, ${brand.gradientTo})`,
        boxShadow: `0 4px 12px -2px ${brand.accent}50`,
      }}
    >
      {name.charAt(0)}
    </div>
  );
}
