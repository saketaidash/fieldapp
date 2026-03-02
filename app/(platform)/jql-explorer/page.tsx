"use client";

import { useState } from "react";
import { addDays, format } from "date-fns";
import { useJiraIssues } from "@/hooks/useJiraIssues";
import { useCapacitySummary } from "@/hooks/useCapacitySummary";
import { JqlInputForm } from "@/components/jql-explorer/JqlInputForm";
import { IssuesTable } from "@/components/jql-explorer/IssuesTable";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import type { JiraIssue } from "@/types/jira";

const today = new Date();
const DEFAULT_START = format(today, "yyyy-MM-dd") + "T00:00:00Z";
const DEFAULT_END = format(addDays(today, 13), "yyyy-MM-dd") + "T23:59:59Z";

export default function JqlExplorerPage() {
  const { mutate, isPending, error } = useJiraIssues();
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [total, setTotal] = useState(0);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [currentJql, setCurrentJql] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Get capacity data for suggested assignee column
  const { data: capacityData } = useCapacitySummary({
    startDate: DEFAULT_START,
    endDate: DEFAULT_END,
  });

  const handleSearch = (jql: string) => {
    setCurrentJql(jql);
    setIssues([]);
    setNextPageToken(undefined);
    mutate(
      { jql, maxResults: 50 },
      {
        onSuccess: (data) => {
          setIssues(data.issues);
          setTotal(data.total);
          setNextPageToken(data.nextPageToken);
        },
      }
    );
  };

  const handleLoadMore = () => {
    if (!nextPageToken || !currentJql) return;
    setIsLoadingMore(true);
    mutate(
      { jql: currentJql, maxResults: 50, nextPageToken },
      {
        onSuccess: (data) => {
          setIssues((prev) => [...prev, ...data.issues]);
          setTotal(data.total);
          setNextPageToken(data.nextPageToken);
          setIsLoadingMore(false);
        },
        onError: () => setIsLoadingMore(false),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Run any JQL query to pull Jira issues. The &quot;Suggested&quot; column
          shows available team members based on current capacity.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <JqlInputForm onSearch={handleSearch} isLoading={isPending} />
      </div>

      {error && <ErrorAlert message={error.message} />}

      {(issues.length > 0 || (!isPending && currentJql)) && (
        <div className="rounded-xl border border-border bg-card p-5">
          <IssuesTable
            issues={issues}
            total={total}
            hasMore={!!nextPageToken}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
            capacityPeople={capacityData?.people}
          />
        </div>
      )}
    </div>
  );
}
