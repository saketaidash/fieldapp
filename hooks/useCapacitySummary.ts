"use client";

import { useQuery } from "@tanstack/react-query";
import type { TeamCapacitySummary } from "@/types/capacity";

interface Params {
  startDate?: string;
  endDate?: string;
}

export function useCapacitySummary(params: Params = {}) {
  const searchParams = new URLSearchParams();
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);

  return useQuery<TeamCapacitySummary, Error>({
    queryKey: ["capacity-summary", params.startDate, params.endDate],
    queryFn: async () => {
      const query = searchParams.toString();
      const res = await fetch(`/api/capacity/summary${query ? `?${query}` : ""}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "Failed to fetch capacity summary");
      }
      return res.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
