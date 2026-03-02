"use client";

import { format, parseISO, isWeekend, differenceInCalendarDays } from "date-fns";
import type { EcologistTimeline, GanttSurveyBlock as SurveyBlockType } from "@/types/survey";
import { cn } from "@/lib/utils";

interface Props {
  ecologist: EcologistTimeline;
  /** All dates displayed in the Gantt (ISO strings) */
  dates: string[];
}

/**
 * A single ecologist row in the Gantt chart.
 * Shows survey blocks spanning multiple day-columns, meeting indicators, and free-day highlights.
 */
export function GanttRow({ ecologist, dates }: Props) {
  // Build a lookup: date → GanttDay
  const dayMap = new Map(ecologist.days.map((d) => [d.date, d]));

  // Collect unique survey blocks assigned to this ecologist
  const surveyBlocks: Array<{
    block: SurveyBlockType;
    colStart: number;
    colSpan: number;
  }> = [];

  const seenSurveys = new Set<string>();
  for (const day of ecologist.days) {
    for (const survey of day.surveys) {
      if (seenSurveys.has(survey.issueKey)) continue;
      seenSurveys.add(survey.issueKey);

      // Find column positions within our date range
      const startIdx = dates.indexOf(survey.startDate);
      const endIdx = dates.indexOf(survey.endDate);

      // If block is partially or fully visible
      const effectiveStart = Math.max(startIdx, 0);
      const effectiveEnd = endIdx >= 0 ? endIdx : dates.length - 1;
      const colSpan = effectiveEnd - effectiveStart + 1;

      if (colSpan > 0) {
        surveyBlocks.push({
          block: survey,
          colStart: effectiveStart,
          colSpan,
        });
      }
    }
  }

  return (
    <div className="contents">
      {/* Ecologist name cell */}
      <div className="sticky left-0 z-20 flex items-center bg-card border-b border-r border-border px-3 py-2 min-w-[140px]">
        <div>
          <p className="text-xs font-medium truncate max-w-[120px]">
            {ecologist.displayName}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {ecologist.totalAssignedSurveys} surveys &middot;{" "}
            {ecologist.totalFreeDays} free days
          </p>
        </div>
      </div>

      {/* Day cells */}
      {dates.map((dateStr, colIdx) => {
        const day = dayMap.get(dateStr);
        const weekend = isWeekend(parseISO(dateStr));
        const hasSurvey = (day?.surveys.length ?? 0) > 0;
        const meetingCount = day?.meetings.length ?? 0;
        const isFree = day?.isFree ?? (!weekend && !hasSurvey);

        return (
          <div
            key={dateStr}
            className={cn(
              "relative border-b border-r border-border min-h-[48px] flex items-end justify-center pb-1",
              weekend && "bg-muted/30",
              isFree && !weekend && "bg-green-50/50 dark:bg-green-950/10",
              hasSurvey && "bg-blue-50/30 dark:bg-blue-950/10"
            )}
          >
            {/* Meeting indicator */}
            {meetingCount > 0 && (
              <div
                className="absolute top-1 right-1"
                title={`${meetingCount} meeting${meetingCount > 1 ? "s" : ""}`}
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[8px] font-bold text-white">
                  {meetingCount}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Survey block overlays — rendered as a separate row that spans the full grid */}
    </div>
  );
}
