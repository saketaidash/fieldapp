"use client";

import { useQuery } from "@tanstack/react-query";
import type { TimelineData } from "@/types/survey";

export function useTimeline(startDate: string, endDate: string) {
  return useQuery<TimelineData, Error>({
    queryKey: ["survey-timeline", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ startDate, endDate });
      const res = await fetch(`/api/survey/timeline?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "Failed to fetch timeline");
      }
      return res.json();
    },
    staleTime: 60 * 1000, // 1 minute
  });
}
