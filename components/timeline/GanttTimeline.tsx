"use client";

import { format, parseISO, isWeekend, isToday } from "date-fns";
import type { TimelineData, GanttSurveyBlock as SurveyBlockType } from "@/types/survey";
import { cn } from "@/lib/utils";

interface Props {
  data: TimelineData;
}

/**
 * The main Gantt chart: ecologist rows x day columns.
 * Each ecologist row shows day cells with background colors and overlay blocks for surveys.
 */
export function GanttTimeline({ data }: Props) {
  const { ecologists, dateRange } = data;

  // Build the array of date strings from dateRange
  const dates: string[] = [];
  {
    const start = parseISO(dateRange.startDate);
    const end = parseISO(dateRange.endDate);
    const current = new Date(start);
    while (current <= end) {
      dates.push(format(current, "yyyy-MM-dd"));
      current.setDate(current.getDate() + 1);
    }
  }

  if (ecologists.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No ecologist data available. Check TEAM_MEMBER_UPNS configuration.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <div
        className="inline-grid min-w-full"
        style={{
          gridTemplateColumns: `140px repeat(${dates.length}, minmax(36px, 1fr))`,
        }}
      >
        {/* ── Header Row ── */}
        <div className="sticky left-0 z-30 bg-muted/70 border-b border-r border-border px-3 py-2 flex items-end">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Ecologist
          </span>
        </div>
        {dates.map((dateStr) => {
          const d = parseISO(dateStr);
          const weekend = isWeekend(d);
          const today = isToday(d);
          return (
            <div
              key={dateStr}
              className={cn(
                "border-b border-r border-border px-0.5 py-1 text-center",
                weekend && "bg-muted/40",
                today && "bg-primary/10"
              )}
            >
              <p className="text-[9px] text-muted-foreground leading-none">
                {format(d, "EEE")}
              </p>
              <p
                className={cn(
                  "text-[11px] font-medium leading-tight mt-0.5",
                  today && "text-primary font-bold"
                )}
              >
                {format(d, "d")}
              </p>
              <p className="text-[8px] text-muted-foreground/60 leading-none">
                {format(d, "MMM")}
              </p>
            </div>
          );
        })}

        {/* ── Ecologist Rows ── */}
        {ecologists.map((eco) => {
          // Build a lookup: date → day
          const dayMap = new Map(eco.days.map((d) => [d.date, d]));

          // Collect unique survey blocks for overlay rendering
          const surveyBlocks: Array<{
            block: SurveyBlockType;
            colStart: number;
            colSpan: number;
          }> = [];
          const seenSurveys = new Set<string>();
          for (const day of eco.days) {
            for (const survey of day.surveys) {
              if (seenSurveys.has(survey.issueKey)) continue;
              seenSurveys.add(survey.issueKey);

              const startIdx = dates.indexOf(survey.startDate);
              const endIdx = dates.indexOf(survey.endDate);
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
            <div key={eco.upn} className="contents">
              {/* Name cell */}
              <div className="sticky left-0 z-20 bg-card border-b border-r border-border px-3 py-2 flex items-center min-w-[140px]">
                <div>
                  <p className="text-xs font-medium truncate max-w-[120px]">
                    {eco.displayName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {eco.totalAssignedSurveys} survey{eco.totalAssignedSurveys !== 1 ? "s" : ""}{" "}
                    &middot; {eco.totalFreeDays} free
                  </p>
                </div>
              </div>

              {/* Day cells */}
              {dates.map((dateStr, colIdx) => {
                const day = dayMap.get(dateStr);
                const weekend = isWeekend(parseISO(dateStr));
                const today = isToday(parseISO(dateStr));
                const hasSurvey = (day?.surveys.length ?? 0) > 0;
                const meetingCount = day?.meetings.length ?? 0;
                const isFree = day?.isFree ?? false;

                // Check if this day is the START of a survey block
                const blockStart = surveyBlocks.find(
                  (sb) => sb.colStart === colIdx
                );

                return (
                  <div
                    key={dateStr}
                    className={cn(
                      "relative border-b border-r border-border min-h-[48px]",
                      weekend && "bg-muted/30",
                      today && "bg-primary/5",
                      isFree && !weekend && !today && "bg-green-50/40 dark:bg-green-950/10"
                    )}
                  >
                    {/* Survey block overlay — only rendered from the starting cell */}
                    {blockStart && (
                      <div
                        className={cn(
                          "absolute top-1 bottom-1 left-0.5 rounded-md",
                          "bg-blue-500/90 text-white text-[10px] leading-tight",
                          "flex items-center px-1.5 overflow-hidden cursor-default",
                          "shadow-sm hover:bg-blue-600 transition-colors z-10"
                        )}
                        style={{
                          // Span across multiple cells using calc
                          width: `calc(${blockStart.colSpan * 100}% + ${(blockStart.colSpan - 1) * 1}px - 4px)`,
                        }}
                        title={`${blockStart.block.issueKey}: ${blockStart.block.issueSummary}\n${blockStart.block.startDate} to ${blockStart.block.endDate} (${blockStart.block.durationDays}d)`}
                      >
                        <span className="truncate font-medium">
                          {blockStart.block.issueKey}
                        </span>
                      </div>
                    )}

                    {/* Meeting indicator */}
                    {meetingCount > 0 && (
                      <div
                        className="absolute bottom-0.5 right-0.5"
                        title={day?.meetings
                          .map((m) => `${m.startTime}-${m.endTime}: ${m.subject}`)
                          .join("\n")}
                      >
                        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[7px] font-bold text-white">
                          {meetingCount}
                        </span>
                      </div>
                    )}

                    {/* Free day indicator */}
                    {isFree && !weekend && !hasSurvey && meetingCount === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[9px] text-green-500/60 font-medium">
                          free
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
