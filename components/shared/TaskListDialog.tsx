"use client";

import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import type { JiraIssue } from "@/types/jira";
import { cn } from "@/lib/utils";

interface Props {
  personName: string;
  issues: JiraIssue[];
  trigger: React.ReactNode;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  indeterminate: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
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

export function TaskListDialog({ personName, issues, trigger }: Props) {
  const [open, setOpen] = useState(false);

  if (issues.length === 0) return <>{trigger}</>;

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </span>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          {/* Dialog */}
          <div className="relative z-10 max-h-[80vh] w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold">
                  Tasks assigned to {personName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {issues.length} issue{issues.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="space-y-2">
                {issues.map((issue) => {
                  const sp = getStoryPoints(issue);
                  const statusKey =
                    issue.fields.status.statusCategory.key;
                  return (
                    <div
                      key={issue.id}
                      className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-primary">
                            {issue.key}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                              STATUS_COLORS[statusKey] ??
                                "bg-gray-100 text-gray-700"
                            )}
                          >
                            {issue.fields.status.name}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm line-clamp-2">
                          {issue.fields.summary}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          {sp !== null && (
                            <span className="font-medium">{sp} SP</span>
                          )}
                          {issue.fields.priority && (
                            <span>{issue.fields.priority.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
