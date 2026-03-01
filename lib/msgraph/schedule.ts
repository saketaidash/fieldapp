import { graphFetch } from "./client";
import type { GraphScheduleResponse, ScheduleResponse } from "@/types/msgraph";

const BATCH_SIZE = 20; // Microsoft Graph hard limit for getSchedule

export async function getTeamSchedule(
  userUpns: string[],
  startDateTime: string, // ISO 8601 UTC
  endDateTime: string,
  availabilityViewInterval = 30
): Promise<ScheduleResponse[]> {
  if (userUpns.length === 0) return [];

  const results: ScheduleResponse[] = [];

  // Batch in groups of BATCH_SIZE (Graph API limit)
  for (let i = 0; i < userUpns.length; i += BATCH_SIZE) {
    const batch = userUpns.slice(i, i + BATCH_SIZE);
    const anchorUpn = encodeURIComponent(batch[0]);

    const data = await graphFetch<GraphScheduleResponse>(
      `/users/${anchorUpn}/calendar/getSchedule`,
      {
        method: "POST",
        body: JSON.stringify({
          schedules: batch,
          startTime: { dateTime: startDateTime, timeZone: "UTC" },
          endTime: { dateTime: endDateTime, timeZone: "UTC" },
          availabilityViewInterval,
        }),
      }
    );

    results.push(...data.value);
  }

  return results;
}
