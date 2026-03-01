import { jiraFetch } from "./client";
import type { JiraProject, JiraBoard } from "@/types/jira";

interface ProjectsResponse {
  values: JiraProject[];
  isLast: boolean;
  maxResults: number;
}

interface BoardsResponse {
  values: JiraBoard[];
  isLast: boolean;
  maxResults: number;
  total: number;
}

export async function getProjects(): Promise<JiraProject[]> {
  const data = await jiraFetch<ProjectsResponse>(
    "/api/3/project/search?maxResults=50&orderBy=name",
    { revalidate: 600 }
  );
  return data.values;
}

export async function getBoards(): Promise<JiraBoard[]> {
  const data = await jiraFetch<BoardsResponse>(
    "/agile/1.0/board?maxResults=50",
    { revalidate: 600 }
  );
  return data.values;
}
