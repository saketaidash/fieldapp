"use client";

import { cn } from "@/lib/utils";

interface Props {
  meetingHours: number;
  taskHours: number;
  freeHours: number;
  totalWorkingHours: number;
  className?: string;
  showLabels?: boolean;
}

export function StackedCapacityBar({
  meetingHours,
  taskHours,
  freeHours,
  totalWorkingHours,
  className,
  showLabels = false,
}: Props) {
  if (totalWorkingHours === 0) {
    return (
      <div className={cn("h-4 w-full rounded-full bg-muted", className)} />
    );
  }

  const meetingPct = Math.min((meetingHours / totalWorkingHours) * 100, 100);
  const taskPct = Math.min((taskHours / totalWorkingHours) * 100, 100 - meetingPct);
  const freePct = Math.max(0, 100 - meetingPct - taskPct);
  const overflow = meetingHours + taskHours > totalWorkingHours;

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex h-4 w-full overflow-hidden rounded-full",
          overflow ? "ring-2 ring-red-400/50" : "",
          className
        )}
      >
        {/* Meetings — blue */}
        {meetingPct > 0 && (
          <div
            className="bg-blue-500 transition-all"
            style={{ width: `${meetingPct}%` }}
            title={`Meetings: ${Math.round(meetingHours)}h`}
          />
        )}
        {/* Tasks — orange */}
        {taskPct > 0 && (
          <div
            className={cn(
              "transition-all",
              overflow ? "bg-red-500" : "bg-orange-500"
            )}
            style={{ width: `${taskPct}%` }}
            title={`Tasks: ${Math.round(taskHours)}h`}
          />
        )}
        {/* Free — gray */}
        {freePct > 0 && (
          <div
            className="bg-gray-200 dark:bg-gray-700 transition-all"
            style={{ width: `${freePct}%` }}
            title={`Free: ${Math.round(freeHours)}h`}
          />
        )}
      </div>
      {showLabels && (
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-blue-500" />
            Meetings {Math.round(meetingHours)}h
          </span>
          <span className="flex items-center gap-1">
            <span className={cn("inline-block h-2 w-2 rounded-sm", overflow ? "bg-red-500" : "bg-orange-500")} />
            Tasks {Math.round(taskHours)}h
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-gray-200 dark:bg-gray-700" />
            Free {Math.round(freeHours)}h
          </span>
        </div>
      )}
    </div>
  );
}
