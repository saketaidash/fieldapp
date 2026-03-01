import { NextRequest, NextResponse } from "next/server";
import { searchIssues } from "@/lib/jira/issues";
import { z } from "zod";

const RequestSchema = z.object({
  jql: z.string().min(1, "JQL query is required"),
  maxResults: z.number().int().min(1).max(100).default(50),
  nextPageToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = RequestSchema.parse(await req.json());
    const data = await searchIssues(body.jql, body.maxResults, body.nextPageToken);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: err.errors },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/jira/issues]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
