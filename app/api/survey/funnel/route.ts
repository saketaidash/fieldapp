import { NextResponse } from "next/server";
import { searchIssues } from "@/lib/jira/issues";
import { getFunnelStages } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * GET /api/survey/funnel
 * Runs all 4 funnel JQL queries in parallel and returns stage counts + recent issues.
 */
export async function GET() {
  try {
    const stageConfigs = getFunnelStages();

    const stageResults = await Promise.all(
      stageConfigs.map(async (stage) => {
        try {
          const data = await searchIssues(stage.jql, 50);
          return {
            id: stage.id,
            label: stage.label,
            count: data.total,
            issues: data.issues,
          };
        } catch (err) {
          console.error(`Funnel stage ${stage.id} failed:`, err);
          return { id: stage.id, label: stage.label, count: 0, issues: [] };
        }
      })
    );

    return NextResponse.json({
      stages: stageResults,
      totalCases: stageResults.reduce((sum, s) => sum + s.count, 0),
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Funnel API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch funnel data" },
      { status: 500 }
    );
  }
}
