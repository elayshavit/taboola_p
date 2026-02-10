"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getCompanyBrand } from "@/config/brand";
export type LogoVariant = "avatar" | "inline" | "badge";

export type LogoSize = "sidebar" | "sm" | "md" | "lg" | "hero";

const sizeMap: Record<LogoSize, number> = {
  sidebar: 32,
  sm: 32,
  md: 40,
  lg: 56,
  hero: 56,
};

interface CompanyLogoProps {
  slug: string;
  name: string;
  size?: LogoSize | number;
  variant?: LogoVariant;
  className?: string;
  /** Optional custom logo URL (e.g. Clearbit) - overrides built-in brand logo */
  logoSrc?: string;
}

function MonogramFallback({
  fallbackText,
  size,
  brand,
  className,
}: {
  fallbackText: string;
  size: number;
  brand: ReturnType<typeof getCompanyBrand>;
  className?: string;
}) {
  const fontSize = Math.max(10, Math.floor(size * 0.45));
  return (
    <div
      className={cn(
        "flex items-center justify-center font-bold text-white shrink-0",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize,
        background: `linear-gradient(135deg, ${brand.gradientFrom}, ${brand.gradientTo})`,
        boxShadow: `0 2px 8px -2px ${brand.accent}50`,
      }}
    >
      {fallbackText}
    </div>
  );
}

export function CompanyLogo({
  slug,
  name,
  size = "md",
  variant = "avatar",
  className,
  logoSrc: customLogoSrc,
}: CompanyLogoProps) {
  const brand = getCompanyBrand(slug);
  const logoSrc = customLogoSrc ?? brand.logoSrc;
  const px = typeof size === "number" ? size : sizeMap[size];
  const [hasError, setHasError] = React.useState(false);

  const useMonogram =
    hasError || brand.markMode === "monogram" || !logoSrc;

  const containerClass = cn(
    "shrink-0 overflow-hidden flex items-center justify-center",
    variant === "avatar" && "rounded-xl ring-1 ring-border/40 bg-background/80 dark:bg-card/80",
    variant === "badge" && "rounded-lg ring-1 ring-border/30 bg-white/90 dark:bg-card/90 p-1",
    variant === "inline" && "rounded-lg",
    className
  );

  if (useMonogram) {
    return (
      <MonogramFallback
        fallbackText={brand.fallbackMonogram}
        size={px}
        brand={brand}
        className={cn(containerClass, "rounded-xl")}
      />
    );
  }

  const padding = variant === "badge" ? 4 : 2;
  const innerSize = px - padding * 2;

  return (
    <div
      className={containerClass}
      style={{
        width: px,
        height: px,
        minWidth: px,
        minHeight: px,
      }}
    >
      <Image
        src={logoSrc}
        alt={brand.logoAlt}
        width={innerSize}
        height={innerSize}
        className="object-contain"
        style={{ width: innerSize, height: innerSize }}
        onError={() => setHasError(true)}
        unoptimized={logoSrc.endsWith(".svg")}
      />
    </div>
  );
}
