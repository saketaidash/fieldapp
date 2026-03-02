"use client";

import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Command Center",
  "/jql-explorer": "JQL Explorer",
  "/availability": "Team Availability",
  "/sprint-capacity": "Sprint Capacity",
};

export function Header() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const title = PAGE_TITLES[pathname] ?? "CapacityIQ";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <button
        onClick={() => queryClient.invalidateQueries()}
        className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        title="Refresh all data"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Refresh
      </button>
    </header>
  );
}
