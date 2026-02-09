"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getCompanyBrand } from "@/config/brand";

type AccentSlug = string | "default";

interface GlassCardProps extends React.ComponentProps<typeof motion.div> {
  accent?: AccentSlug;
  hover?: boolean;
  accentBar?: "top" | "bottom" | "none";
}

const KNOWN_ACCENTS: Record<string, string> = {
  default: "hover:border-primary/30",
  taboola: "hover:border-[oklch(0.55_0.22_250)]/50",
  teads: "hover:border-[oklch(0.55_0.26_305)]/50",
  "the-trade-desk": "hover:border-[oklch(0.5_0.24_264)]/50",
  "simpli-fi": "hover:border-[oklch(0.5_0.18_165)]/50",
};

export function GlassCard({
  className,
  accent = "default",
  hover = true,
  accentBar = "none",
  ...props
}: GlassCardProps) {
  const brand = accent !== "default" ? getCompanyBrand(accent) : null;

  return (
    <motion.div
      className={cn(
        "glass-card rounded-xl py-6 relative overflow-hidden",
        hover && "glass-card-hover",
        hover && (KNOWN_ACCENTS[accent] ?? "hover:border-primary/30"),
        className
      )}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {accentBar !== "none" && brand && (
        <div
          className={cn(
            "absolute left-0 right-0 h-1",
            accentBar === "top" ? "top-0" : "bottom-0"
          )}
          style={{
            background: `linear-gradient(90deg, ${brand.gradientFrom}, ${brand.gradientTo})`,
          }}
          aria-hidden
        />
      )}
    </motion.div>
  );
}
