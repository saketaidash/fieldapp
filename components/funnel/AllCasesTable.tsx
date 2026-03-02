"use client";

import type { FunnelStage } from "@/types/survey";
import type { SurveyAssignment } from "@/types/survey";
import type { JiraIssue } from "@/types/jira";
import { cn } from "@/lib/utils";

interface Props {
  stages: FunnelStage[];
  assignments: Map<string, SurveyAssignment>;
}

const STAGE_BADGES: Record<string, string> = {
  cases_received: "bg-blue-100 text-blue-700",
  surveys_assigned: "bg-amber-100 text-amber-700",
  surveys_completed: "bg-green-100 text-green-700",
  reports_issued: "bg-purple-100 text-purple-700",
};

export function AllCasesTable({ stages, assignments }: Props) {
  // Flatten all issues from all stages, keeping track of which stage they belong to
  const allCases: Array<{
    issue: JiraIssue;
    stageId: string;
    stageLabel: string;
  }> = [];

  // Use a Set to prevent duplicates (same issue might appear in multiple JQLs)
  const seenKeys = new Set<string>();
  for (const stage of stages) {
    for (const issue of stage.issues) {
      if (!seenKeys.has(issue.key)) {
        seenKeys.add(issue.key);
        allCases.push({
          issue,
          stageId: stage.id,
          stageLabel: stage.label,
        });
      }
    }
  }

  if (allCases.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No cases found across funnel stages.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{allCases.length}</span>{" "}
        cases across all stages
      </p>

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
                Stage
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Ecologist
              </th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                Days
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Survey Dates
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allCases.slice(0, 50).map(({ issue, stageId, stageLabel }) => {
              const assignment = assignments.get(issue.key);

              return (
                <tr
                  key={issue.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-primary">
                    {issue.key}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="line-clamp-1">
                      {issue.fields.summary}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        STAGE_BADGES[stageId] ?? "bg-gray-100 text-gray-700"
                      )}
                    >
                      {stageLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {assignment ? (
                      <span className="font-medium">
                        {assignment.ecologistDisplayName}
                      </span>
                    ) : (
                      <span className="text-xs italic text-muted-foreground">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {assignment ? (
                      <span className="font-mono">
                        {assignment.surveyDurationDays}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {assignment ? (
                      <span>
                        {assignment.surveyStartDate} &rarr;{" "}
                        {assignment.surveyEndDate}
                      </span>
                    ) : (
                      <span>--</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
