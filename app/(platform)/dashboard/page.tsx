"use client";

import { useState } from "react";
import { addDays, format } from "date-fns";
import { useCapacitySummary } from "@/hooks/useCapacitySummary";
import { CapacitySummaryCards } from "@/components/dashboard/CapacitySummaryCards";
import { TeamCapacityGrid } from "@/components/dashboard/TeamCapacityGrid";
import { TeamWorkloadChart } from "@/components/dashboard/TeamWorkloadChart";
import { ReassignmentPanel } from "@/components/dashboard/ReassignmentPanel";
import { WeeklyCalendarGrid } from "@/components/dashboard/WeeklyCalendarGrid";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";

const today = new Date();
const DEFAULT_START = format(today, "yyyy-MM-dd") + "T00:00:00Z";
const DEFAULT_END = format(addDays(today, 13), "yyyy-MM-dd") + "T23:59:59Z";

export default function DashboardPage() {
  const [dateRange] = useState({ start: DEFAULT_START, end: DEFAULT_END });
  const { data, isLoading, error } = useCapacitySummary({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  if (isLoading) return <LoadingSpinner text="Loading capacity data..." />;
  if (error) return <ErrorAlert message={error.message} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Subtitle */}
      <div>
        <p className="text-sm text-muted-foreground">
          Field team capacity for the next 14 days. Meetings reduce available
          hours; tasks consume remaining capacity.
        </p>
      </div>

      {/* Section 1: Action KPI Cards */}
      <CapacitySummaryCards data={data} />

      {/* Section 2: Team Capacity Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Team Capacity</h2>
        <TeamCapacityGrid data={data} />
      </div>

      {/* Section 3: Reassignment Suggestions */}
      <div className="rounded-xl border border-border bg-card p-5">
        <ReassignmentPanel data={data} />
      </div>

      {/* Section 4: Stacked Workload Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">
          Hours Breakdown
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            Meetings + Tasks + Free time per person
          </span>
        </h2>
        <TeamWorkloadChart data={data} />
      </div>

      {/* Section 5: Weekly Calendar Overview */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">
          Weekly Calendar
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            Daily meeting load and free time
          </span>
        </h2>
        <WeeklyCalendarGrid people={data.people} />
      </div>
    </div>
  );
}
