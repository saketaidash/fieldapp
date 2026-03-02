import { NextRequest, NextResponse } from "next/server";
import { searchIssues } from "@/lib/jira/issues";
import { getBulkSurveyAssignments } from "@/lib/jira/properties";
import { getTeamSchedule } from "@/lib/msgraph/schedule";
import { getTeamUpns, getFunnelStages } from "@/lib/env";
import { buildTimeline } from "@/lib/survey/timeline-aggregator";
import { addDays, format } from "date-fns";

export const dynamic = "force-dynamic";

/**
 * GET /api/survey/timeline?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 *
 * Aggregates 3 data sources:
 * 1. Jira issues (assigned + unassigned cases via funnel JQL)
 * 2. Jira issue properties (survey assignments with ecologist + dates)
 * 3. MS Graph calendar (ecologist schedule/meetings)
 *
 * Returns: TimelineData for the Gantt view.
 */
export async function GET(req: NextRequest) {
  try {
    const startDate =
      req.nextUrl.searchParams.get("startDate") ??
      format(new Date(), "yyyy-MM-dd");
    const endDate =
      req.nextUrl.searchParams.get("endDate") ??
      format(addDays(new Date(), 60), "yyyy-MM-dd");

    const teamUpns = getTeamUpns();
    const funnelStages = getFunnelStages();

    // Get JQL for the stages we need
    const assignedJql = funnelStages.find((s) => s.id === "surveys_assigned")?.jql ?? "";
    const receivedJql = funnelStages.find((s) => s.id === "cases_received")?.jql ?? "";

    // Fetch in parallel:
    // 1. Assigned survey issues (from Jira via JQL)
    // 2. Unassigned / received cases (from Jira via JQL)
    // 3. Calendar schedules (from MS Graph)
    const [assignedResult, receivedResult, schedules] = await Promise.all([
      assignedJql
        ? searchIssues(assignedJql, 100).catch(() => ({ issues: [], total: 0 }))
        : Promise.resolve({ issues: [], total: 0 }),
      receivedJql
        ? searchIssues(receivedJql, 100).catch(() => ({ issues: [], total: 0 }))
        : Promise.resolve({ issues: [], total: 0 }),
      getTeamSchedule(
        teamUpns,
        `${startDate}T00:00:00`,
        `${endDate}T23:59:59`,
        30
      ).catch(() => []),
    ]);

    // Get all issue keys from both results for bulk property fetch
    const allIssueKeys = [
      ...assignedResult.issues.map((i) => i.key),
      ...receivedResult.issues.map((i) => i.key),
    ];
    const uniqueKeys = [...new Set(allIssueKeys)];

    // Fetch survey assignments from Jira issue properties
    const assignments = await getBulkSurveyAssignments(uniqueKeys);

    // Build the timeline
    const timeline = buildTimeline(
      teamUpns,
      assignments,
      assignedResult.issues,
      receivedResult.issues,
      schedules,
      startDate,
      endDate
    );

    return NextResponse.json(timeline);
  } catch (err) {
    console.error("Timeline API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to build timeline" },
      { status: 500 }
    );
  }
}
