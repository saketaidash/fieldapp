"use client";

import { useQuery } from "@tanstack/react-query";
import type { JiraSprint, JiraBoard } from "@/types/jira";

export function useSprints(boardId: number | null) {
  return useQuery<{ sprints: JiraSprint[] }, Error>({
    queryKey: ["sprints", boardId],
    enabled: boardId !== null,
    queryFn: async () => {
      const res = await fetch(`/api/jira/sprints?boardId=${boardId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "Failed to fetch sprints");
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBoards() {
  return useQuery<{ boards: JiraBoard[] }, Error>({
    queryKey: ["boards"],
    queryFn: async () => {
      const res = await fetch("/api/jira/projects");
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "Failed to fetch boards");
      }
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
}
