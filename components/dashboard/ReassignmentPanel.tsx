"use client";

import { useMemo } from "react";
import { ArrowRight, ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";
import type { TeamCapacitySummary } from "@/types/capacity";
import { generateReassignmentSuggestions } from "@/lib/capacity/reassignment";
import { UtilizationBadge } from "@/components/shared/UtilizationBadge";

interface Props {
  data: TeamCapacitySummary;
}

export function ReassignmentPanel({ data }: Props) {
  const analysis = useMemo(() => generateReassignmentSuggestions(data), [data]);

  if (analysis.isBalanced) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 p-5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
              Team is balanced
            </p>
            <p className="text-xs text-green-600 dark:text-green-500">
              No team members are overloaded. Capacity is well distributed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (analysis.suggestions.length === 0) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30 p-5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
              {analysis.overloadedMembers} member{analysis.overloadedMembers > 1 ? "s" : ""} overloaded
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-500">
              No available team members to accept tasks. Consider expanding the team or reprioritizing work.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Reassignment Suggestions
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {analysis.suggestions.length} suggestion{analysis.suggestions.length !== 1 ? "s" : ""}
          </span>
        </h3>
      </div>

      <div className="space-y-2">
        {analysis.suggestions.map((s, idx) => (
          <div
            key={`${s.issue.key}-${idx}`}
            className="rounded-lg border border-border bg-card p-4 hover:shadow-sm transition-shadow"
          >
            {/* Task info */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-primary font-medium">
                    {s.issue.key}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {s.storyPoints} SP ~ {s.estimatedHours}h
                  </span>
                </div>
                <p className="mt-0.5 text-sm line-clamp-1">
                  {s.issue.fields.summary}
                </p>
              </div>
            </div>

            {/* From → To */}
            <div className="mt-3 flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 rounded-md bg-red-50 dark:bg-red-950/30 px-2 py-1">
                <span className="font-medium">{s.fromDisplayName}</span>
                <span className="text-muted-foreground">
                  {s.fromUtilizationBefore}%
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-green-600 font-medium">
                  {s.fromUtilizationAfter}%
                </span>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

              <div className="flex items-center gap-1.5 rounded-md bg-green-50 dark:bg-green-950/30 px-2 py-1">
                <span className="font-medium">{s.toDisplayName}</span>
                <span className="text-muted-foreground">
                  {s.toUtilizationBefore}%
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-blue-600 font-medium">
                  {s.toUtilizationAfter}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
