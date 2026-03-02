"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import type { JiraIssue } from "@/types/jira";
import type { Ecologist } from "@/types/survey";
import { useAssignSurvey } from "@/hooks/useSurveyAssignment";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Props {
  issue: JiraIssue;
  ecologists: Ecologist[];
  onAssigned?: () => void;
  onCancel?: () => void;
}

export function AssignmentForm({
  issue,
  ecologists,
  onAssigned,
  onCancel,
}: Props) {
  const [selectedUpn, setSelectedUpn] = useState("");
  const [days, setDays] = useState(2);
  const [startDate, setStartDate] = useState(
    format(addDays(new Date(), 1), "yyyy-MM-dd")
  );

  const assignMutation = useAssignSurvey();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUpn) return;

    assignMutation.mutate(
      {
        issueKey: issue.key,
        ecologistUpn: selectedUpn,
        surveyDurationDays: days,
        surveyStartDate: startDate,
      },
      {
        onSuccess: () => onAssigned?.(),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 text-xs">
        <span className="font-mono text-primary font-medium">{issue.key}</span>
        <span className="text-muted-foreground line-clamp-1 flex-1">
          {issue.fields.summary}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {/* Ecologist select */}
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Ecologist
          </label>
          <select
            value={selectedUpn}
            onChange={(e) => setSelectedUpn(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          >
            <option value="">Select...</option>
            {ecologists.map((eco) => (
              <option key={eco.upn} value={eco.upn}>
                {eco.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* Days input */}
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Days
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
        </div>

        {/* Start date */}
        <div>
          <label className="block text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
        </div>
      </div>

      {/* Error message */}
      {assignMutation.isError && (
        <p className="text-xs text-destructive">
          {assignMutation.error.message}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={assignMutation.isPending || !selectedUpn}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors",
            "hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {assignMutation.isPending && (
            <Loader2 className="h-3 w-3 animate-spin" />
          )}
          Assign Survey
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
