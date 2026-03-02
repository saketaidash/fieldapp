"use client";

import type { PersonCapacity } from "@/types/capacity";
import { StackedCapacityBar } from "@/components/shared/StackedCapacityBar";
import { UtilizationBadge } from "@/components/shared/UtilizationBadge";
import { TaskListDialog } from "@/components/shared/TaskListDialog";
import { ListChecks } from "lucide-react";

interface Props {
  person: PersonCapacity;
}

export function PersonCapacityRow({ person }: Props) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {person.displayName.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium">{person.displayName}</p>
          <UtilizationBadge percent={person.utilizationPercent} size="sm" />
        </div>

        {/* Stacked capacity bar */}
        <StackedCapacityBar
          meetingHours={person.meetingHours}
          taskHours={person.taskHours}
          freeHours={person.freeHours}
          totalWorkingHours={person.totalWorkingHours}
        />

        {/* Stats row */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span>{person.issueCount} issues</span>
            <span>{person.totalStoryPoints} SP</span>
            <span>{Math.round(person.meetingHours)}h meetings</span>
            <span>{Math.round(person.taskHours)}h tasks</span>
            <span>{Math.round(person.freeHours)}h free</span>
          </div>
          <TaskListDialog
            personName={person.displayName}
            issues={person.assignedIssues}
            trigger={
              <button className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0">
                <ListChecks className="h-3 w-3" />
                Tasks
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}
