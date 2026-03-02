"use client";

import { useState } from "react";
import { ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import type { JiraIssue } from "@/types/jira";
import type { Ecologist } from "@/types/survey";
import { AssignmentForm } from "./AssignmentForm";
import { cn } from "@/lib/utils";

interface Props {
  unassignedCases: JiraIssue[];
  ecologists: Ecologist[];
}

export function CaseAssignmentPanel({
  unassignedCases,
  ecologists,
}: Props) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (unassignedCases.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
        <ClipboardList className="h-4 w-4" />
        All cases have been assigned. Great work!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {unassignedCases.length}
        </span>{" "}
        cases awaiting assignment
      </p>

      <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
        {unassignedCases.slice(0, 20).map((issue) => {
          const isExpanded = expandedKey === issue.key;
          return (
            <div key={issue.key} className="bg-card">
              {/* Case header — click to expand/collapse */}
              <button
                type="button"
                onClick={() =>
                  setExpandedKey(isExpanded ? null : issue.key)
                }
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-primary font-medium shrink-0">
                    {issue.key}
                  </span>
                  <span className="text-sm line-clamp-1 text-foreground">
                    {issue.fields.summary}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>

              {/* Expanded assignment form */}
              {isExpanded && (
                <div className="border-t border-border bg-muted/10 px-4 py-3">
                  <AssignmentForm
                    issue={issue}
                    ecologists={ecologists}
                    onAssigned={() => setExpandedKey(null)}
                    onCancel={() => setExpandedKey(null)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {unassignedCases.length > 20 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing 20 of {unassignedCases.length} unassigned cases.
        </p>
      )}
    </div>
  );
}
