import { NextRequest, NextResponse } from "next/server";
import { searchIssues } from "@/lib/jira/issues";
import { getTeamSchedule } from "@/lib/msgraph/schedule";
import { mergeCapacity } from "@/lib/capacity/aggregator";
import { getTeamUpns } from "@/lib/env";
import { addDays } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();

    const startDate =
      searchParams.get("startDate") ?? now.toISOString().split("T")[0] + "T00:00:00Z";
    const endDate =
      searchParams.get("endDate") ??
      addDays(now, 14).toISOString().split("T")[0] + "T23:59:59Z";

    const teamUpns = getTeamUpns();

    if (teamUpns.length === 0) {
      return NextResponse.json(
        { error: "No team members configured. Set TEAM_MEMBER_UPNS in .env.local" },
        { status: 400 }
      );
    }

    // Build JQL for open issues assigned to team members
    const upnList = teamUpns.join(",");
    const jql = `assignee in (${upnList}) AND statusCategory != Done ORDER BY updated DESC`;

    // Fetch Jira issues and MS Graph schedule in parallel
    const [jiraData, schedules] = await Promise.all([
      searchIssues(jql, 100).catch((err: Error) => {
        console.error("Jira fetch failed:", err.message);
        return { issues: [], total: 0, maxResults: 100 };
      }),
      getTeamSchedule(teamUpns, startDate, endDate).catch((err: Error) => {
        console.error("Graph fetch failed:", err.message);
        return [];
      }),
    ]);

    const summary = mergeCapacity(
      jiraData.issues,
      schedules,
      teamUpns,
      startDate,
      endDate
    );

    return NextResponse.json(summary);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/capacity/summary]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
