"use client";

import type { PersonAvailability } from "@/types/capacity";
import { cn, formatDateShort, STATUS_LABELS } from "@/lib/utils";
import { DayDetailPopover } from "./DayDetailPopover";

interface Props {
  availability: PersonAvailability[];
  startDate: Date;
  endDate: Date;
}

const STATUS_CELL_COLORS: Record<string, string> = {
  "0": "bg-green-200 hover:bg-green-300 dark:bg-green-900 dark:hover:bg-green-800",
  "1": "bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-900 dark:hover:bg-yellow-800",
  "2": "bg-red-200 hover:bg-red-300 dark:bg-red-900 dark:hover:bg-red-800",
  "3": "bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600",
  "4": "bg-blue-200 hover:bg-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800",
};

export function AvailabilityHeatmap({ availability, startDate, endDate }: Props) {
  if (availability.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No availability data. Select a date range and fetch.
      </div>
    );
  }

  const days = availability[0]?.days ?? [];

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Legend:</span>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn("h-3 w-3 rounded-sm", STATUS_CELL_COLORS[key]?.split(" ")[0])} />
            <span>{label}</span>
          </div>
        ))}
        <span className="ml-2 text-[10px] italic">Click a cell for details</span>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div
          className="grid gap-1 min-w-max"
          style={{
            gridTemplateColumns: `180px repeat(${days.length}, minmax(44px, 1fr))`,
          }}
        >
          {/* Header row */}
          <div className="flex items-end pb-1">
            <span className="text-xs font-medium text-muted-foreground">Member</span>
          </div>
          {days.map((day) => (
            <div
              key={day.date}
              className="text-center text-xs text-muted-foreground pb-1 leading-tight"
            >
              {formatDateShort(day.date)}
            </div>
          ))}

          {/* Data rows */}
          {availability.map((person) => (
            <div key={person.upn} className="contents">
              <div
                className="flex items-center pr-2 text-sm font-medium truncate"
                title={person.upn}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary mr-2">
                  {person.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="truncate">{person.displayName}</span>
              </div>
              {person.days.map((day) => (
                <DayDetailPopover
                  key={`${person.upn}-${day.date}`}
                  personName={person.displayName}
                  day={day}
                >
                  <div
                    className={cn(
                      "h-10 rounded flex flex-col items-center justify-center transition-colors",
                      STATUS_CELL_COLORS[day.dominantStatus] ?? "bg-muted"
                    )}
                  >
                    {day.meetingCount > 0 && (
                      <span className="text-[10px] font-semibold leading-none">
                        {day.meetingCount}
                      </span>
                    )}
                    <span className="text-[9px] text-muted-foreground leading-none">
                      {Math.round(day.freePercent)}%
                    </span>
                  </div>
                </DayDetailPopover>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
