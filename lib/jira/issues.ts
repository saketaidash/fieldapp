import { env } from "@/lib/env";
import { jiraFetch } from "./client";
import type { JiraSearchResponse } from "@/types/jira";

const BASE_FIELDS = [
  "summary",
  "assignee",
  "status",
  "priority",
  "issuetype",
  "labels",
  "updated",
  "customfield_10020", // sprint
];

export async function searchIssues(
  jql: string,
  maxResults = 50,
  nextPageToken?: string
): Promise<JiraSearchResponse> {
  const storyPointsField = env.JIRA_STORY_POINTS_FIELD;
  const fields = [...BASE_FIELDS, storyPointsField];

  return jiraFetch<JiraSearchResponse>("/api/3/search/jql", {
    method: "POST",
    body: JSON.stringify({
      jql,
      fields,
      maxResults,
      ...(nextPageToken ? { nextPageToken } : {}),
    }),
    revalidate: 0, // JQL results should never be cached
  });
}
