import Link from "next/link";
import { AnalyzeForm } from "@/components/home/analyze-form";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          AI Marketing Intelligence
        </h1>
        <p className="text-muted-foreground max-w-lg">
          Analyze any company&apos;s 2025 marketing strategy, campaigns, and brand
          perception. Enter a company name below or browse pre-loaded companies.
        </p>
      </div>

      <AnalyzeForm />

      <div className="flex flex-wrap justify-center gap-3">
        <span className="text-sm text-muted-foreground">Pre-loaded:</span>
        {["taboola", "teads", "the-trade-desk", "simpli-fi"].map((slug) => (
          <Link
            key={slug}
            href={`/company/${slug}`}
            className="rounded-lg px-4 py-2 text-sm border border-border hover:bg-muted/60 transition-colors"
          >
            {slug
              .split("-")
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(" ")}
          </Link>
        ))}
        <Link
          href="/compare"
          className="rounded-lg px-4 py-2 text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Compare All
        </Link>
      </div>
    </div>
  );
}
