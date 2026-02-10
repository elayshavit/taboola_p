"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border/60 bg-background/60 backdrop-blur-xl px-4 md:px-6">
      <div className="flex flex-1 items-center justify-between gap-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
            AI
          </span>
          <span className="hidden sm:inline">AdTech Insider</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="gap-1.5"
          >
            <Link href="/">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Analyze company</span>
              <span className="sm:hidden">Analyze</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
