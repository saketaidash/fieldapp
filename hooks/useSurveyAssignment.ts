"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AssignSurveyRequest, AssignSurveyResponse } from "@/types/api";

export function useAssignSurvey() {
  const queryClient = useQueryClient();

  return useMutation<AssignSurveyResponse, Error, AssignSurveyRequest>({
    mutationFn: async (payload) => {
      const res = await fetch("/api/survey/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "Failed to assign survey");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both funnel and timeline to reflect the new assignment
      queryClient.invalidateQueries({ queryKey: ["survey-funnel"] });
      queryClient.invalidateQueries({ queryKey: ["survey-timeline"] });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (issueKey: string) => {
      const res = await fetch(`/api/survey/assign?issueKey=${issueKey}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "Failed to remove assignment");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-funnel"] });
      queryClient.invalidateQueries({ queryKey: ["survey-timeline"] });
    },
  });
}
