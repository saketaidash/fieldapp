import type { JiraIssue } from "./jira";

export interface PersonCapacity {
  upn: string;
  displayName: string;
  assignedIssues: JiraIssue[];
  totalStoryPoints: number;
  issueCount: number;
  availableHours: number;
  busyHours: number;
  totalWorkingHours: number;
  utilizationPercent: number;
}

export interface TeamCapacitySummary {
  people: PersonCapacity[];
  totalIssues: number;
  totalStoryPoints: number;
  averageUtilization: number;
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
}

export interface PersonAvailability {
  upn: string;
  displayName: string;
  days: DayAvailability[];
}
