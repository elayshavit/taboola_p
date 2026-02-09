"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { RouteTransition } from "./route-transition";
import { CommandCenter } from "@/components/command/command-center";
import { useCompaniesStore } from "@/store/use-companies-store";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const hydrate = useCompaniesStore((s) => s.hydrate);

  useEffect(() => {
    try {
      hydrate();
    } catch (e) {
      console.warn("[AppShell] Hydrate failed:", e);
    }
  }, [hydrate]);

  return (
    <div className="min-h-screen flex">
      <Sidebar onCommandOpen={() => setCommandOpen(true)} />
      <CommandCenter open={commandOpen} onOpenChange={setCommandOpen} />
      <main className="flex-1 flex flex-col min-w-0 md:pl-0 pt-16 md:pt-0 md:pl-0 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.4] dark:opacity-[0.15]"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, var(--chart-1) 0%, transparent 50%)",
          }}
          aria-hidden
        />
        <div className="flex-1 p-4 md:p-6 lg:p-8 relative z-10">
          <RouteTransition>{children}</RouteTransition>
        </div>
      </main>
    </div>
  );
}
