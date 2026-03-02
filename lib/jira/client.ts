import { env } from "@/lib/env";

function getAuthHeader(): string {
  const credentials = `${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

interface FetchOptions extends RequestInit {
  revalidate?: number | false;
}

export async function jiraFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { revalidate, ...fetchOptions } = options;
  const url = `${env.JIRA_BASE_URL}/rest${path}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      Authorization: getAuthHeader(),
      Accept: "application/json",
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    next: revalidate !== undefined ? { revalidate } : { revalidate: 60 },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Jira API ${response.status} for ${path}: ${errorText}`);
  }

  // Handle empty response bodies (e.g., PUT/DELETE return 200/201/204 with no body)
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    return undefined as unknown as T;
  }
  return JSON.parse(text) as T;
}
