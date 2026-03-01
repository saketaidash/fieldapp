"use client";

import { useMutation } from "@tanstack/react-query";
import type { JiraSearchResponse } from "@/types/jira";
import type { JiraIssuesRequest } from "@/types/api";

export function useJiraIssues() {
  return useMutation<JiraSearchResponse, Error, JiraIssuesRequest>({
    mutationFn: async (payload) => {
      const res = await fetch("/api/jira/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "Failed to search issues");
      }
      return res.json();
    },
  });
}
