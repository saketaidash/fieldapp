import type { JiraIssue } from "./jira";

export interface MeetingSummary {
  subject: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface DayCapacityDetail {
  date: string; // YYYY-MM-DD
  meetingHours: number;
  taskHours: number;
  freeHours: number;
  totalWorkingHours: number;
  meetingCount: number;
}

export interface PersonCapacity {
  upn: string;
  displayName: string;
  assignedIssues: JiraIssue[];
  totalStoryPoints: number;
  issueCount: number;
  /** Hours free on calendar (no meetings) */
  availableHours: number;
  /** Hours blocked by calendar meetings */
  busyHours: number;
  /** Total working hours in the period (Mon-Fri 8am-5pm) */
  totalWorkingHours: number;
  /** busyHours mapped from meetings */
  meetingHours: number;
  /** Story points x 4h */
  taskHours: number;
  /** totalWorkingHours - meetingHours - taskHours (floored at 0) */
  freeHours: number;
  /** (taskHours / (totalWorkingHours - meetingHours)) x 100 */
  utilizationPercent: number;
  /** Per-day breakdown for weekly calendar grid */
  dailyCapacity?: DayCapacityDetail[];
}

export interface TeamCapacitySummary {
  people: PersonCapacity[];
  totalIssues: number;
  totalStoryPoints: number;
  averageUtilization: number;
  overloadedCount: number;
  availableCount: number;
  unassignedIssueCount: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface DayAvailability {
  date: string; // ISO date string YYYY-MM-DD
  dominantStatus: string; // "0" | "1" | "2" | "3" | "4"
  freeSlots: number;
  busySlots: number;
  totalSlots: number;
  freePercent: number;
  meetingCount: number;
}

export interface PersonAvailability {
  upn: string;
  displayName: string;
  days: DayAvailability[];
}
