/**
 * Timeline aggregator — merges Jira issues, survey assignments (from issue properties),
 * and MS Graph calendar data into a single TimelineData structure for the Gantt view.
 */
import type { ScheduleResponse } from "@/types/msgraph";
import type { SurveyAssignment } from "@/types/survey";
import type {
  EcologistTimeline,
  GanttDay,
  GanttSurveyBlock,
  GanttMeetingBlock,
  TimelineData,
  TimelineSummaryStats,
} from "@/types/survey";
import type { JiraIssue } from "@/types/jira";
import {
  eachDayOfInterval,
  format,
  isWeekend,
  parseISO,
  isWithinInterval,
  endOfWeek,
  endOfMonth,
  isBefore,
  isAfter,
} from "date-fns";

export function buildTimeline(
  teamUpns: string[],
  assignments: Map<string, SurveyAssignment>,
  assignedIssues: JiraIssue[],
  unassignedIssues: JiraIssue[],
  schedules: ScheduleResponse[],
  startDate: string,
  endDate: string
): TimelineData {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const days = eachDayOfInterval({ start, end });

  // Group assignments by ecologist UPN
  const ecologistAssignments = new Map<string, SurveyAssignment[]>();
  for (const [, assignment] of assignments) {
    const key = assignment.ecologistUpn.toLowerCase();
    if (!ecologistAssignments.has(key)) ecologistAssignments.set(key, []);
    ecologistAssignments.get(key)!.push(assignment);
  }

  // Build per-ecologist timeline
  const ecologists: EcologistTimeline[] = teamUpns.map((upn) => {
    const upnLower = upn.toLowerCase();
    const myAssignments = ecologistAssignments.get(upnLower) ?? [];
    const schedule = schedules.find(
      (s) => s.scheduleId.toLowerCase() === upnLower
    );

    let totalFreeDays = 0;
    let totalBusyDays = 0;

    const ganttDays: GanttDay[] = days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const weekend = isWeekend(day);

      // Find surveys overlapping this day
      const surveys: GanttSurveyBlock[] = myAssignments
        .filter((a) => {
          const aStart = parseISO(a.surveyStartDate);
          const aEnd = parseISO(a.surveyEndDate);
          return isWithinInterval(day, { start: aStart, end: aEnd });
        })
        .map((a) => {
          const issue = assignedIssues.find((i) => i.key === a.issueKey);
          return {
            issueKey: a.issueKey,
            issueSummary: issue?.fields.summary ?? a.issueKey,
            startDate: a.surveyStartDate,
            endDate: a.surveyEndDate,
            durationDays: a.surveyDurationDays,
            ecologistUpn: a.ecologistUpn,
          };
        });

      // Get meetings for this day from MS Graph schedule
      const meetings = extractMeetingsForDay(schedule, day);

      const isFree = !weekend && surveys.length === 0;
      if (!weekend) {
        if (surveys.length > 0) totalBusyDays++;
        else totalFreeDays++;
      }

      return { date: dateStr, isWeekend: weekend, surveys, meetings, isFree };
    });

    return {
      upn,
      displayName: upn.split("@")[0],
      days: ganttDays,
      totalAssignedSurveys: myAssignments.length,
      totalFreeDays,
      totalBusyDays,
    };
  });

  // Filter truly unassigned cases (not in assignments map)
  const assignedKeys = new Set(assignments.keys());
  const unassigned = unassignedIssues.filter((i) => !assignedKeys.has(i.key));

  // Summary stats
  const today = new Date();
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const monthEnd = endOfMonth(today);

  const allAssignmentsList = Array.from(assignments.values());
  const upcomingThisWeek = allAssignmentsList.filter((a) => {
    const aStart = parseISO(a.surveyStartDate);
    return !isBefore(aStart, today) && !isAfter(aStart, weekEnd);
  }).length;

  const totalFreeDaysThisMonth = ecologists.reduce(
    (sum, e) =>
      sum +
      e.days.filter((d) => {
        const dt = parseISO(d.date);
        return d.isFree && !isAfter(dt, monthEnd) && !isBefore(dt, today);
      }).length,
    0
  );

  const summaryStats: TimelineSummaryStats = {
    totalAssigned: assignments.size,
    upcomingThisWeek,
    totalFreeDaysThisMonth,
  };

  return {
    ecologists,
    dateRange: { startDate, endDate },
    unassignedCases: unassigned,
    summaryStats,
  };
}

/**
 * Extract meeting blocks from a ScheduleResponse for a specific day.
 * Uses scheduleItems (detailed meeting objects) if available.
 */
function extractMeetingsForDay(
  schedule: ScheduleResponse | undefined,
  day: Date
): GanttMeetingBlock[] {
  if (!schedule?.scheduleItems) return [];
  const dateStr = format(day, "yyyy-MM-dd");

  return schedule.scheduleItems
    .filter((item) => {
      if (item.status === "free") return false;
      const itemDate = item.start?.dateTime?.split("T")[0];
      return itemDate === dateStr;
    })
    .map((item) => ({
      subject: item.subject ?? "Meeting",
      date: dateStr,
      startTime:
        item.start?.dateTime?.split("T")[1]?.substring(0, 5) ?? "00:00",
      endTime:
        item.end?.dateTime?.split("T")[1]?.substring(0, 5) ?? "00:00",
      durationMinutes: calculateDurationMinutes(
        item.start?.dateTime ?? "",
        item.end?.dateTime ?? ""
      ),
    }));
}

function calculateDurationMinutes(start: string, end: string): number {
  if (!start || !end) return 0;
  return Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000
  );
}
