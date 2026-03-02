"use client";

import { useFunnel } from "@/hooks/useFunnel";
import { FunnelStageCards } from "@/components/funnel/FunnelStageCards";
import { FunnelChart } from "@/components/funnel/FunnelChart";
import { AllCasesTable } from "@/components/funnel/AllCasesTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import type { SurveyAssignment } from "@/types/survey";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data, isLoading, error } = useFunnel();

  // Bulk-fetch assignments for all issue keys once funnel loads
  const [assignments, setAssignments] = useState<Map<string, SurveyAssignment>>(
    new Map()
  );

  useEffect(() => {
    if (!data) return;

    // Collect unique issue keys across all stages
    const keys = new Set<string>();
    for (const stage of data.stages) {
      for (const issue of stage.issues) {
        keys.add(issue.key);
      }
    }
    if (keys.size === 0) return;

    // Fetch assignments in bulk
    const issueKeysParam = Array.from(keys).join(",");
    fetch(`/api/survey/assign?issueKeys=${encodeURIComponent(issueKeysParam)}`)
      .then((res) => (res.ok ? res.json() : { assignments: [] }))
      .then((result: { assignments: SurveyAssignment[] }) => {
        const map = new Map<string, SurveyAssignment>();
        for (const a of result.assignments) {
          map.set(a.issueKey, a);
        }
        setAssignments(map);
      })
      .catch(() => {
        // silently ignore — table just shows "Unassigned"
      });
  }, [data]);

  if (isLoading) return <LoadingSpinner text="Loading funnel data..." />;
  if (error) return <ErrorAlert message={error.message} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Subtitle */}
      <div>
        <p className="text-sm text-muted-foreground">
          End-to-end visibility of field survey cases — from intake to report
          delivery.
        </p>
      </div>

      {/* Section 1: Funnel Stage KPI Cards */}
      <FunnelStageCards stages={data.stages} />

      {/* Section 2: Funnel Bar Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">
          Pipeline Overview
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            Cases per stage
          </span>
        </h2>
        <FunnelChart stages={data.stages} />
      </div>

      {/* Section 3: All Cases Table */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">
          All Cases
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            Combined view across every funnel stage
          </span>
        </h2>
        <AllCasesTable stages={data.stages} assignments={assignments} />
      </div>

      {/* Last updated */}
      <p className="text-right text-xs text-muted-foreground">
        Last updated: {new Date(data.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
}
