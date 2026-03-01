"use client";

import { useState } from "react";
import { addDays, format } from "date-fns";
import { useCapacitySummary } from "@/hooks/useCapacitySummary";
import { CapacitySummaryCards } from "@/components/dashboard/CapacitySummaryCards";
import { TeamWorkloadChart } from "@/components/dashboard/TeamWorkloadChart";
import { PersonCapacityRow } from "@/components/sprint-capacity/PersonCapacityRow";
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

  if (isLoading) return <LoadingSpinner text="Loading capacity data…" />;
  if (error) return <ErrorAlert message={error.message} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div>
        <p className="text-sm text-muted-foreground">
          Showing open issues + calendar availability for the next 14 days
        </p>
      </div>

      {/* KPI Cards */}
      <CapacitySummaryCards data={data} />

      {/* Workload Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">
          Assigned Hours vs Available Hours
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            (4h per story point assumed)
          </span>
        </h2>
        <TeamWorkloadChart data={data} />
      </div>

      {/* Per-person rows */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Individual Breakdown</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.people
            .sort((a, b) => b.utilizationPercent - a.utilizationPercent)
            .map((person) => (
              <PersonCapacityRow key={person.upn} person={person} />
            ))}
        </div>
      </div>
    </div>
  );
}
