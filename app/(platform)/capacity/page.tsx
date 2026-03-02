"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import { useTimeline } from "@/hooks/useTimeline";
import { TimelineSummaryCards } from "@/components/timeline/TimelineSummaryCards";
import { GanttTimeline } from "@/components/timeline/GanttTimeline";
import { CaseAssignmentPanel } from "@/components/timeline/CaseAssignmentPanel";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";

const today = new Date();
const DEFAULT_START = format(today, "yyyy-MM-dd");
const DEFAULT_END = format(addDays(today, 59), "yyyy-MM-dd");

export default function CapacityPage() {
  const [startDate] = useState(DEFAULT_START);
  const [endDate] = useState(DEFAULT_END);

  const { data, isLoading, error } = useTimeline(startDate, endDate);

  if (isLoading) return <LoadingSpinner text="Loading capacity timeline..." />;
  if (error) return <ErrorAlert message={error.message} />;
  if (!data) return null;

  // Build ecologist list for the assignment form
  const ecologists = data.ecologists.map((e) => ({
    upn: e.upn,
    displayName: e.displayName,
  }));

  return (
    <div className="space-y-6">
      {/* Subtitle */}
      <div>
        <p className="text-sm text-muted-foreground">
          Field ecologist capacity for the next 60 days. Survey blocks, calendar
          meetings, and free days at a glance.
        </p>
      </div>

      {/* Section 1: Summary KPI Cards */}
      <TimelineSummaryCards stats={data.summaryStats} />

      {/* Section 2: Gantt Timeline */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">
          Capacity Timeline
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {data.dateRange.startDate} to {data.dateRange.endDate}
          </span>
        </h2>
        <GanttTimeline data={data} />
        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-6 rounded bg-blue-500/90" />
            Survey
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[7px] font-bold text-white">
              2
            </span>
            Meetings
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-6 rounded bg-green-50 border border-green-200" />
            Free day
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-6 rounded bg-muted/30 border border-border" />
            Weekend
          </span>
        </div>
      </div>

      {/* Section 3: Case Assignment Panel */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">
          Assign Cases
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            Unassigned cases from the funnel
          </span>
        </h2>
        <CaseAssignmentPanel
          unassignedCases={data.unassignedCases}
          ecologists={ecologists}
        />
      </div>
    </div>
  );
}
