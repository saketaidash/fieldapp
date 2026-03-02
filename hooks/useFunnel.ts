"use client";

import { useQuery } from "@tanstack/react-query";
import type { FunnelData } from "@/types/survey";

export function useFunnel() {
  return useQuery<FunnelData, Error>({
    queryKey: ["survey-funnel"],
    queryFn: async () => {
      const res = await fetch("/api/survey/funnel");
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "Failed to fetch funnel data");
      }
      return res.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // auto-refresh every 5 min
  });
}
