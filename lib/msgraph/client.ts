import { getAccessToken } from "./auth";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export async function graphFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();
  const url = path.startsWith("http") ? path : `${GRAPH_BASE}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: 'outlook.timezone="UTC"',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Graph API ${response.status} for ${path}: ${errorText}`);
  }

  return response.json() as Promise<T>;
}
