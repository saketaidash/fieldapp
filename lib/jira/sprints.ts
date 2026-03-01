import { jiraFetch } from "./client";
import type { JiraSprint } from "@/types/jira";

interface SprintListResponse {
  values: JiraSprint[];
  isLast: boolean;
  maxResults: number;
  startAt: number;
  total: number;
}

export async function getSprintsForBoard(boardId: number): Promise<JiraSprint[]> {
  const data = await jiraFetch<SprintListResponse>(
    `/agile/1.0/board/${boardId}/sprint?state=active,future&maxResults=50`,
    { revalidate: 300 }
  );
  return data.values;
}

export async function getSprintById(sprintId: number): Promise<JiraSprint> {
  return jiraFetch<JiraSprint>(`/agile/1.0/sprint/${sprintId}`, {
    revalidate: 300,
  });
}
