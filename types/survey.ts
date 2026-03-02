import type { JiraIssue } from "./jira";

// ─── Funnel Stage Definition ──────────────────────────────────────────────────

export type FunnelStageId =
  | "cases_received"
  | "surveys_assigned"
  | "surveys_completed"
  | "reports_issued";

export interface FunnelStage {
  id: FunnelStageId;
  label: string;
  count: number;
  issues: JiraIssue[];
}

export interface FunnelData {
  stages: FunnelStage[];
  totalCases: number;
  lastUpdated: string; // ISO timestamp
}

// ─── Survey Assignment (stored as Jira Issue Property) ───────────────────────

export interface SurveyAssignment {
  issueKey: string;
  ecologistUpn: string;
  ecologistDisplayName: string;
  surveyDurationDays: number;
  surveyStartDate: string; // YYYY-MM-DD
  surveyEndDate: string; // YYYY-MM-DD (computed: startDate + durationDays business days)
  assignedAt: string; // ISO timestamp
}

/** The Jira Issue Property key used for storing survey assignments */
export const JIRA_SURVEY_PROPERTY_KEY = "capacityiq_survey_assignment";

// ─── Gantt / Timeline Types ──────────────────────────────────────────────────

export interface GanttSurveyBlock {
  issueKey: string;
  issueSummary: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  durationDays: number;
  ecologistUpn: string;
}

export interface GanttMeetingBlock {
  subject: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
}

export interface GanttDay {
  date: string; // YYYY-MM-DD
  isWeekend: boolean;
  surveys: GanttSurveyBlock[];
  meetings: GanttMeetingBlock[];
  isFree: boolean; // no surveys AND not heavy meeting day
}

export interface EcologistTimeline {
  upn: string;
  displayName: string;
  days: GanttDay[];
  totalAssignedSurveys: number;
  totalFreeDays: number;
  totalBusyDays: number;
}

export interface TimelineSummaryStats {
  totalAssigned: number;
  upcomingThisWeek: number;
  totalFreeDaysThisMonth: number;
}

export interface TimelineData {
  ecologists: EcologistTimeline[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
  unassignedCases: JiraIssue[];
  summaryStats: TimelineSummaryStats;
}

// ─── Ecologist (team member) ─────────────────────────────────────────────────

export interface Ecologist {
  upn: string;
  displayName: string;
}
