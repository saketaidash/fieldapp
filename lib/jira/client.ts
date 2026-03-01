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

  return response.json() as Promise<T>;
}
