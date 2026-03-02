import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getSurveyAssignment,
  setSurveyAssignment,
  deleteSurveyAssignment,
  getBulkSurveyAssignments,
  buildSurveyAssignment,
} from "@/lib/jira/properties";
import { getTeamUpns } from "@/lib/env";

export const dynamic = "force-dynamic";

const assignSchema = z.object({
  issueKey: z.string().min(1),
  ecologistUpn: z.string().email(),
  surveyDurationDays: z.number().int().min(1).max(60),
  surveyStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

/**
 * POST /api/survey/assign
 * Create or overwrite a survey assignment on a Jira issue.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = assignSchema.parse(body);

    // Derive display name from UPN
    const displayName = parsed.ecologistUpn.split("@")[0];

    const assignment = buildSurveyAssignment({
      issueKey: parsed.issueKey,
      ecologistUpn: parsed.ecologistUpn,
      ecologistDisplayName: displayName,
      surveyDurationDays: parsed.surveyDurationDays,
      surveyStartDate: parsed.surveyStartDate,
    });

    await setSurveyAssignment(parsed.issueKey, assignment);

    return NextResponse.json({ success: true, assignment });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: err.errors },
        { status: 400 }
      );
    }
    console.error("Assign survey error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to assign survey" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/survey/assign?issueKeys=KEY-1,KEY-2,KEY-3
 * Bulk-fetch survey assignments for given issue keys.
 */
export async function GET(req: NextRequest) {
  try {
    const keysParam = req.nextUrl.searchParams.get("issueKeys") ?? "";
    const issueKeys = keysParam
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    if (issueKeys.length === 0) {
      return NextResponse.json({ assignments: [] });
    }

    const assignmentsMap = await getBulkSurveyAssignments(issueKeys);
    const assignments = Array.from(assignmentsMap.values());

    return NextResponse.json({ assignments });
  } catch (err) {
    console.error("Bulk assignments fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/survey/assign?issueKey=KEY-1
 * Remove a survey assignment from a Jira issue.
 */
export async function DELETE(req: NextRequest) {
  try {
    const issueKey = req.nextUrl.searchParams.get("issueKey");
    if (!issueKey) {
      return NextResponse.json(
        { error: "issueKey query parameter is required" },
        { status: 400 }
      );
    }

    await deleteSurveyAssignment(issueKey);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete assignment error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
