"use client";

import type { JiraIssue } from "@/types/jira";
import type { PersonCapacity } from "@/types/capacity";
import { ExternalLink, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  issues: JiraIssue[];
  total: number;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore?: boolean;
  jiraBaseUrl?: string;
  /** If provided, shows a "Suggested Assignee" column */
  capacityPeople?: PersonCapacity[];
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  indeterminate: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  Highest: "text-red-600",
  High: "text-orange-500",
  Medium: "text-yellow-600",
  Low: "text-blue-500",
  Lowest: "text-gray-400",
};

function getStoryPoints(issue: JiraIssue): number | null {
  const fields = issue.fields as Record<string, unknown>;
  for (const key of [
    "customfield_10016",
    "customfield_10028",
    "customfield_10014",
  ]) {
    if (typeof fields[key] === "number") return fields[key] as number;
  }
  return null;
}

/** Find the least utilized person who can take this issue */
function getSuggestedAssignee(
  issue: JiraIssue,
  people: PersonCapacity[]
): PersonCapacity | null {
  const currentAssignee =
    issue.fields.assignee?.emailAddress?.toLowerCase();

  // Find available people (< 70% utilization) sorted by utilization
  const candidates = people
    .filter((p) => {
      if (p.upn.toLowerCase() === currentAssignee) return false;
      return p.utilizationPercent < 70;
    })
    .sort((a, b) => a.utilizationPercent - b.utilizationPercent);

  return candidates[0] ?? null;
}

export function IssuesTable({
  issues,
  total,
  hasMore,
  onLoadMore,
  isLoadingMore,
  jiraBaseUrl,
  capacityPeople,
}: Props) {
  if (issues.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No issues found for this query.
      </div>
    );
  }

  const showSuggested = capacityPeople && capacityPeople.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{issues.length}</span>{" "}
          of <span className="font-medium text-foreground">{total}</span> issues
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Key
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Summary
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Assignee
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Priority
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                SP
              </th>
              {showSuggested && (
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Suggested
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {issues.map((issue) => {
              const sp = getStoryPoints(issue);
              const statusKey = issue.fields.status.statusCategory.key;
              const suggested = showSuggested
                ? getSuggestedAssignee(issue, capacityPeople!)
                : null;

              return (
                <tr
                  key={issue.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {jiraBaseUrl ? (
                      <a
                        href={`${jiraBaseUrl}/browse/${issue.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        {issue.key}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-primary">{issue.key}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="line-clamp-2">
                      {issue.fields.summary}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {issue.fields.assignee?.displayName ?? (
                      <span className="italic text-xs">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        STATUS_COLORS[statusKey] ??
                          "bg-gray-100 text-gray-700"
                      )}
                    >
                      {issue.fields.status.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        PRIORITY_COLORS[
                          issue.fields.priority?.name ?? ""
                        ] ?? "text-muted-foreground"
                      )}
                    >
                      {issue.fields.priority?.name ?? "--"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">
                    {sp !== null ? sp : "--"}
                  </td>
                  {showSuggested && (
                    <td className="px-4 py-3">
                      {suggested ? (
                        <div className="flex items-center gap-1 text-xs">
                          <ArrowRight className="h-3 w-3 text-green-500" />
                          <span className="text-green-600 font-medium">
                            {suggested.displayName}
                          </span>
                          <span className="text-muted-foreground">
                            ({suggested.utilizationPercent}%)
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          --
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            <ChevronDown className="h-4 w-4" />
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
