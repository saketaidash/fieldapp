/**
 * Client-side capacity merging — works from PersonAvailability (already computed server-side)
 * rather than raw ScheduleResponse. Used in Sprint Capacity page which calls both APIs independently.
 */
import type { JiraIssue } from "@/types/jira";
import type { PersonAvailability } from "@/types/capacity";
import type { TeamCapacitySummary, PersonCapacity } from "@/types/capacity";

const HOURS_PER_SP = 4;

function getStoryPoints(issue: JiraIssue): number {
  const fields = issue.fields as Record<string, unknown>;
  for (const key of ["customfield_10016", "customfield_10028", "customfield_10014"]) {
    if (typeof fields[key] === "number") return fields[key] as number;
  }
  return 0;
}

export function mergeCapacityClient(
  issues: JiraIssue[],
  availability: PersonAvailability[],
  teamUpns: string[],
  startDate: string,
  endDate: string
): TeamCapacitySummary {
  const peopleMap = new Map<string, PersonCapacity>();

  // Init from availability data (already per-person from server)
  for (const a of availability) {
    const freeSlots = a.days.reduce((sum, d) => sum + d.freeSlots, 0);
    const busySlots = a.days.reduce((sum, d) => sum + d.busySlots, 0);
    const totalSlots = a.days.reduce((sum, d) => sum + d.totalSlots, 0);

    peopleMap.set(a.upn.toLowerCase(), {
      upn: a.upn,
      displayName: a.displayName,
      assignedIssues: [],
      totalStoryPoints: 0,
      issueCount: 0,
      availableHours: freeSlots * 0.5,
      busyHours: busySlots * 0.5,
      totalWorkingHours: totalSlots * 0.5,
      utilizationPercent: 0,
    });
  }

  // Also add any team UPNs missing from availability
  for (const upn of teamUpns) {
    if (!peopleMap.has(upn.toLowerCase())) {
      peopleMap.set(upn.toLowerCase(), {
        upn,
        displayName: upn.split("@")[0],
        assignedIssues: [],
        totalStoryPoints: 0,
        issueCount: 0,
        availableHours: 0,
        busyHours: 0,
        totalWorkingHours: 0,
        utilizationPercent: 0,
      });
    }
  }

  // Assign issues
  for (const issue of issues) {
    const email = issue.fields.assignee?.emailAddress?.toLowerCase();
    if (!email || !peopleMap.has(email)) continue;
    const person = peopleMap.get(email)!;
    person.assignedIssues.push(issue);
    person.totalStoryPoints += getStoryPoints(issue);
    person.issueCount += 1;
  }

  // Compute utilization
  for (const person of peopleMap.values()) {
    const hoursNeeded = person.totalStoryPoints * HOURS_PER_SP;
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
