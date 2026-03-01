import type { JiraIssue } from "@/types/jira";
import type { ScheduleResponse } from "@/types/msgraph";
import type { PersonCapacity, TeamCapacitySummary, PersonAvailability, DayAvailability } from "@/types/capacity";
import { getDaysBetween } from "@/lib/utils";

const HOURS_PER_STORY_POINT = 4;
const INTERVAL_MINUTES = 30;
const SLOTS_PER_HOUR = 60 / INTERVAL_MINUTES;

/** Get story points from a Jira issue, checking common field IDs */
function getStoryPoints(issue: JiraIssue): number {
  // Try the standard field first, then fallback aliases
  const fields = issue.fields as Record<string, unknown>;
  const candidates = ["customfield_10016", "customfield_10028", "customfield_10014", "story_points"];
  for (const field of candidates) {
    const val = fields[field];
    if (typeof val === "number" && val > 0) return val;
  }
  return 0;
}

export function mergeCapacity(
  issues: JiraIssue[],
  schedules: ScheduleResponse[],
  teamUpns: string[],
  startDate: string,
  endDate: string
): TeamCapacitySummary {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = getDaysBetween(start, end);
  const slotsPerDay = Math.floor((24 * 60) / INTERVAL_MINUTES);

  const peopleMap = new Map<string, PersonCapacity>();

  // Initialize all team members
  for (const upn of teamUpns) {
    peopleMap.set(upn.toLowerCase(), {
      upn,
      displayName: upn.split("@")[0], // fallback display name
      assignedIssues: [],
      totalStoryPoints: 0,
      issueCount: 0,
      availableHours: 0,
      busyHours: 0,
      totalWorkingHours: 0,
      utilizationPercent: 0,
    });
  }

  // Assign Jira issues to team members
  for (const issue of issues) {
    const email = issue.fields.assignee?.emailAddress?.toLowerCase();
    if (!email || !peopleMap.has(email)) continue;
    const person = peopleMap.get(email)!;
    person.assignedIssues.push(issue);
    person.totalStoryPoints += getStoryPoints(issue);
    person.issueCount += 1;
  }

  // Compute hours from MS Graph schedule
  for (const schedule of schedules) {
    const key = schedule.scheduleId.toLowerCase();
    if (!peopleMap.has(key)) continue;
    const person = peopleMap.get(key)!;
    const view = schedule.availabilityView ?? "";

    let freeSlots = 0;
    let busySlots = 0;
    let workingSlots = 0;

    // Only count working hours (use workingHours or assume 8-17 Mon-Fri)
    const worksOnDay = (d: Date): boolean => {
      const day = d.getDay();
      return day >= 1 && day <= 5; // Mon-Fri
    };

    days.forEach((day, dayIdx) => {
      if (!worksOnDay(day)) return;
      const dayStart = dayIdx * slotsPerDay;
      // Assume 8am-5pm = slots 16-34 (at 30-min intervals from midnight)
      const workStart = dayStart + 16;
      const workEnd = dayStart + 34;
      for (let s = workStart; s < workEnd && s < view.length; s++) {
        const status = view[s];
        workingSlots++;
        if (status === "0") freeSlots++;
        else if (status === "2" || status === "3") busySlots++;
      }
    });

    person.availableHours = freeSlots / SLOTS_PER_HOUR;
    person.busyHours = busySlots / SLOTS_PER_HOUR;
    person.totalWorkingHours = workingSlots / SLOTS_PER_HOUR;
  }

  // Compute utilization
  for (const person of peopleMap.values()) {
    const hoursNeeded = person.totalStoryPoints * HOURS_PER_STORY_POINT;
    person.utilizationPercent =
      person.totalWorkingHours > 0
        ? Math.min((hoursNeeded / person.totalWorkingHours) * 100, 200)
        : 0;
  }

  const people = Array.from(peopleMap.values());
  return {
    people,
    totalIssues: issues.length,
    totalStoryPoints: people.reduce((s, p) => s + p.totalStoryPoints, 0),
    averageUtilization:
      people.length > 0
        ? people.reduce((s, p) => s + p.utilizationPercent, 0) / people.length
        : 0,
    dateRange: { startDate, endDate },
  };
}

/** Build per-person per-day availability for the heatmap */
export function buildPersonAvailability(
  schedules: ScheduleResponse[],
  teamUpns: string[],
  startDate: string,
  endDate: string
): PersonAvailability[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = getDaysBetween(start, end);
  const slotsPerDay = Math.floor((24 * 60) / INTERVAL_MINUTES);

  return teamUpns.map((upn) => {
    const schedule = schedules.find(
      (s) => s.scheduleId.toLowerCase() === upn.toLowerCase()
    );
    const view = schedule?.availabilityView ?? "";

    const dayAvailabilities: DayAvailability[] = days.map((day, idx) => {
      const dayStart = idx * slotsPerDay;
      const daySlots = view.slice(dayStart, dayStart + slotsPerDay);

      const counts: Record<string, number> = { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0 };
      for (const ch of daySlots) {
        if (ch in counts) counts[ch]++;
      }

      const freeSlots = counts["0"];
      const totalSlots = daySlots.length;
      const busySlots = counts["2"] + counts["3"];

      // Dominant status
      const dominant = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .filter(([, v]) => v > 0)[0]?.[0] ?? "0";

      return {
        date: day.toISOString().split("T")[0],
        dominantStatus: dominant,
        freeSlots,
        busySlots,
        totalSlots,
        freePercent: totalSlots > 0 ? (freeSlots / totalSlots) * 100 : 100,
      };
    });

    return {
      upn,
      displayName: schedule?.scheduleId?.split("@")[0] ?? upn.split("@")[0],
      days: dayAvailabilities,
    };
  });
}
