"use client";

import { useMutation } from "@tanstack/react-query";
import type { AvailabilityRequest } from "@/types/api";
import type { ScheduleResponse } from "@/types/msgraph";

interface AvailabilityResponse {
  schedules: ScheduleResponse[];
}

export function useAvailability() {
  return useMutation<AvailabilityResponse, Error, AvailabilityRequest>({
    mutationFn: async (payload) => {
      const res = await fetch("/api/calendar/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "Failed to fetch availability");
      }
      return res.json();
    },
  });
}
