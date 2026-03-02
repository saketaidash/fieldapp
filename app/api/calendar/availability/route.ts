import { NextRequest, NextResponse } from "next/server";
import { getTeamSchedule } from "@/lib/msgraph/schedule";
import { getTeamUpns } from "@/lib/env";
import { z } from "zod";

const RequestSchema = z.object({
  // If empty array, falls back to TEAM_MEMBER_UPNS env var
  emails: z.array(z.string().email()).max(60).default([]),
  startDateTime: z.string().datetime({ message: "startDateTime must be ISO 8601 UTC" }),
  endDateTime: z.string().datetime({ message: "endDateTime must be ISO 8601 UTC" }),
  intervalMinutes: z.number().int().min(15).max(60).default(30),
});

export async function POST(req: NextRequest) {
  try {
    const body = RequestSchema.parse(await req.json());

    // Fall back to env-configured team if no emails passed
    const emails = body.emails.length > 0 ? body.emails : getTeamUpns();

    if (emails.length === 0) {
      return NextResponse.json(
        { error: "No emails provided and TEAM_MEMBER_UPNS is not configured" },
        { status: 400 }
      );
    }

    const schedules = await getTeamSchedule(
      emails,
      body.startDateTime,
      body.endDateTime,
      body.intervalMinutes
    );

    return NextResponse.json({ schedules });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: err.errors },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/calendar/availability]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
