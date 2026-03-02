"use client";

import type { PersonCapacity, DayCapacityDetail } from "@/types/capacity";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface Props {
  people: PersonCapacity[];
}

function getDayCellColor(dc: DayCapacityDetail): string {
  const effectiveCapacity = dc.totalWorkingHours - dc.meetingHours;
  if (effectiveCapacity <= 0) return "bg-red-200 dark:bg-red-900";
  const util = dc.taskHours / effectiveCapacity;
  if (util > 1) return "bg-red-200 dark:bg-red-900";
  if (util > 0.8) return "bg-yellow-200 dark:bg-yellow-900";
  if (util > 0.3) return "bg-green-200 dark:bg-green-900";
  return "bg-blue-100 dark:bg-blue-900/50";
}

export function WeeklyCalendarGrid({ people }: Props) {
  // Collect all unique dates from people who have daily capacity
  const allDates = new Set<string>();
  for (const p of people) {
    if (p.dailyCapacity) {
      for (const dc of p.dailyCapacity) {
        allDates.add(dc.date);
      }
    }
  }

  const dates = Array.from(allDates).sort();
  // Only show first 10 working days max
  const displayDates = dates.slice(0, 10);

  if (displayDates.length === 0 || people.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        No weekly capacity data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Capacity:</span>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-red-200 dark:bg-red-900" />
          <span>Overloaded</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-yellow-200 dark:bg-yellow-900" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-green-200 dark:bg-green-900" />
          <span>Balanced</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-blue-100 dark:bg-blue-900/50" />
          <span>Available</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div
          className="grid gap-1 min-w-max"
          style={{
            gridTemplateColumns: `160px repeat(${displayDates.length}, minmax(72px, 1fr))`,
          }}
        >
          {/* Header */}
          <div className="flex items-end pb-1">
            <span className="text-xs font-medium text-muted-foreground">
              Member
            </span>
          </div>
          {displayDates.map((date) => {
            const d = parseISO(date);
            return (
              <div
                key={date}
                className="text-center text-xs text-muted-foreground pb-1 leading-tight"
              >
                <div className="font-medium">{format(d, "EEE")}</div>
                <div>{format(d, "MMM d")}</div>
              </div>
            );
          })}

          {/* Rows */}
          {people.map((person) => {
            const dcMap = new Map(
              (person.dailyCapacity ?? []).map((dc) => [dc.date, dc])
            );

            return (
              <div key={person.upn} className="contents">
                <div className="flex items-center pr-2 text-sm font-medium truncate">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary mr-2">
                    {person.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate text-xs">
                    {person.displayName}
                  </span>
                </div>
                {displayDates.map((date) => {
                  const dc = dcMap.get(date);
                  if (!dc) {
                    return (
                      <div
                        key={`${person.upn}-${date}`}
                        className="h-12 rounded bg-muted/30"
                      />
                    );
                  }
                  return (
                    <div
                      key={`${person.upn}-${date}`}
                      className={cn(
                        "h-12 rounded flex flex-col items-center justify-center cursor-default transition-colors hover:opacity-80",
                        getDayCellColor(dc)
                      )}
                      title={`${person.displayName} - ${date}\nMeetings: ${dc.meetingCount} (${dc.meetingHours.toFixed(1)}h)\nTasks: ${dc.taskHours.toFixed(1)}h\nFree: ${dc.freeHours.toFixed(1)}h`}
                    >
                      <span className="text-[10px] font-semibold">
                        {dc.meetingCount}mtg
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {dc.freeHours.toFixed(1)}h free
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
