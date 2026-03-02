"use client";

import type { PersonCapacity } from "@/types/capacity";
import { StackedCapacityBar } from "@/components/shared/StackedCapacityBar";
import { UtilizationBadge } from "@/components/shared/UtilizationBadge";
import { TaskListDialog } from "@/components/shared/TaskListDialog";
import { ListChecks } from "lucide-react";

interface Props {
  person: PersonCapacity;
}

export function TeamMemberCard({ person }: Props) {
  const util = person.utilizationPercent;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow">
      {/* Header: avatar + name + badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {person.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{person.displayName}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {person.upn}
            </p>
          </div>
        </div>
        <UtilizationBadge percent={util} />
      </div>

      {/* Stacked capacity bar */}
      <StackedCapacityBar
        meetingHours={person.meetingHours}
        taskHours={person.taskHours}
        freeHours={person.freeHours}
        totalWorkingHours={person.totalWorkingHours}
        showLabels
      />

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{person.issueCount} issues</span>
          <span>{person.totalStoryPoints} SP</span>
        </div>
        <TaskListDialog
          personName={person.displayName}
          issues={person.assignedIssues}
          trigger={
            <button className="flex items-center gap-1 text-xs text-primary hover:underline">
              <ListChecks className="h-3 w-3" />
              View Tasks
            </button>
          }
        />
      </div>
    </div>
  );
}
