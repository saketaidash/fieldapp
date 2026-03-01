import { NextRequest, NextResponse } from "next/server";
import { getSprintsForBoard } from "@/lib/jira/sprints";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const boardId = parseInt(
      searchParams.get("boardId") ?? String(env.JIRA_DEFAULT_BOARD_ID),
      10
    );

    if (isNaN(boardId) || boardId <= 0) {
      return NextResponse.json({ error: "Invalid boardId" }, { status: 400 });
    }

    const sprints = await getSprintsForBoard(boardId);
    return NextResponse.json({ sprints });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/jira/sprints]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
