import type { JiraIssue } from "@/types/jira";
import type { ScheduleResponse } from "@/types/msgraph";
import type {
  PersonCapacity,
  TeamCapacitySummary,
  PersonAvailability,
  DayAvailability,
  DayCapacityDetail,
} from "@/types/capacity";
import { getDaysBetween } from "@/lib/utils";

const HOURS_PER_STORY_POINT = 4;
const INTERVAL_MINUTES = 30;
const SLOTS_PER_HOUR = 60 / INTERVAL_MINUTES;

/** Get story points from a Jira issue, checking common field IDs */
function getStoryPoints(issue: JiraIssue): number {
  const fields = issue.fields as Record<string, unknown>;
  const candidates = [
    "customfield_10016",
    "customfield_10028",
    "customfield_10014",
    "story_points",
  ];
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
      displayName: upn.split("@")[0],
      assignedIssues: [],
      totalStoryPoints: 0,
      issueCount: 0,
      availableHours: 0,
      busyHours: 0,
      totalWorkingHours: 0,
      meetingHours: 0,
      taskHours: 0,
      freeHours: 0,
      utilizationPercent: 0,
      dailyCapacity: [],
    });
  }

  // Assign Jira issues to team members
  let unassignedIssueCount = 0;
  for (const issue of issues) {
    const email = issue.fields.assignee?.emailAddress?.toLowerCase();
    if (!email || !peopleMap.has(email)) {
      if (!email) unassignedIssueCount++;
      continue;
    }
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
    const dailyCapacity: DayCapacityDetail[] = [];

    const worksOnDay = (d: Date): boolean => {
      const day = d.getDay();
      return day >= 1 && day <= 5; // Mon-Fri
    };

    days.forEach((day, dayIdx) => {
      if (!worksOnDay(day)) return;
      const dayStart = dayIdx * slotsPerDay;
      // 8am-5pm = slots 16-34 (at 30-min intervals from midnight)
      const workStart = dayStart + 16;
      const workEnd = dayStart + 34;

      let dayFree = 0;
      let dayBusy = 0;
      let dayWorking = 0;
      let dayMeetingCount = 0;
      let inMeeting = false;

      for (let s = workStart; s < workEnd && s < view.length; s++) {
        const status = view[s];
        dayWorking++;
        workingSlots++;
        if (status === "0") {
          dayFree++;
          freeSlots++;
          inMeeting = false;
        } else if (status === "2" || status === "3") {
          dayBusy++;
          busySlots++;
          if (!inMeeting) {
            dayMeetingCount++;
            inMeeting = true;
          }
        } else {
          if (status === "1") {
            dayBusy++;
            busySlots++;
          }
          inMeeting = false;
        }
      }

      const dayWorkingHours = dayWorking / SLOTS_PER_HOUR;
      const dayMeetingHours = dayBusy / SLOTS_PER_HOUR;

      dailyCapacity.push({
        date: day.toISOString().split("T")[0],
        meetingHours: dayMeetingHours,
        taskHours: 0, // distributed after
        freeHours: dayFree / SLOTS_PER_HOUR,
        totalWorkingHours: dayWorkingHours,
        meetingCount: dayMeetingCount,
      });
    });

    person.availableHours = freeSlots / SLOTS_PER_HOUR;
    person.busyHours = busySlots / SLOTS_PER_HOUR;
    person.totalWorkingHours = workingSlots / SLOTS_PER_HOUR;
    person.meetingHours = busySlots / SLOTS_PER_HOUR;
    person.dailyCapacity = dailyCapacity;
  }

  // Compute utilization with NEW formula:
  // utilization = taskHours / (totalWorkingHours - meetingHours) * 100
  // Meetings REDUCE available capacity
  for (const person of peopleMap.values()) {
    person.taskHours = person.totalStoryPoints * HOURS_PER_STORY_POINT;
    const effectiveCapacity = person.totalWorkingHours - person.meetingHours;
    person.freeHours = Math.max(0, effectiveCapacity - person.taskHours);
    person.utilizationPercent =
      effectiveCapacity > 0
        ? Math.round((person.taskHours / effectiveCapacity) * 100)
        : person.taskHours > 0
        ? 200
        : 0;

    // Distribute task hours evenly across working days
    if (person.dailyCapacity && person.dailyCapacity.length > 0) {
      const hoursPerDay = person.taskHours / person.dailyCapacity.length;
      for (const dc of person.dailyCapacity) {
        const effectiveDayCapacity = dc.totalWorkingHours - dc.meetingHours;
        dc.taskHours = Math.min(hoursPerDay, effectiveDayCapacity);
        dc.freeHours = Math.max(
          0,
          dc.totalWorkingHours - dc.meetingHours - dc.taskHours
        );
      }
    }
  }

  const people = Array.from(peopleMap.values());
  const overloadedCount = people.filter(
    (p) => p.utilizationPercent > 100
  ).length;
  const availableCount = people.filter(
    (p) => p.utilizationPercent < 70
  ).length;

  return {
    people,
    totalIssues: issues.length,
    totalStoryPoints: people.reduce((s, p) => s + p.totalStoryPoints, 0),
    averageUtilization:
      people.length > 0
        ? Math.round(
            people.reduce((s, p) => s + p.utilizationPercent, 0) / people.length
          )
        : 0,
    overloadedCount,
    availableCount,
    unassignedIssueCount,
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

      const counts: Record<string, number> = {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
      };
      for (const ch of daySlots) {
        if (ch in counts) counts[ch]++;
      }

      const freeSlots = counts["0"];
      const totalSlots = daySlots.length;
      const busySlots = counts["2"] + counts["3"];

      // Count distinct meeting blocks during working hours
      let meetingCount = 0;
      let inMeeting = false;
      for (let s = 16; s < 34 && s < daySlots.length; s++) {
        const st = daySlots[s];
        if (st === "2" || st === "3") {
          if (!inMeeting) {
            meetingCount++;
            inMeeting = true;
          }
        } else {
          inMeeting = false;
        }
      }

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
        meetingCount,
      };
    });

    return {
      upn,
      displayName:
        schedule?.scheduleId?.split("@")[0] ?? upn.split("@")[0],
      days: dayAvailabilities,
    };
  });
}
