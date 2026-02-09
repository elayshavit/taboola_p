"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ElementType;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  className,
  size = "default",
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onValueChange(v as T)}
      variant="outline"
      size={size}
      spacing={0}
      className={cn(
        "rounded-lg border border-border/60 bg-muted/30 p-0.5",
        "data-[variant=outline]:shadow-none",
        className
      )}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <ToggleGroupItem
            key={opt.value}
            value={opt.value}
            className="rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {opt.label}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
