// ─── Jira API request/response shapes ────────────────────────────────────────

export interface JiraIssuesRequest {
  jql: string;
  maxResults?: number;
  nextPageToken?: string;
}

export interface JiraSprintsRequest {
  boardId: number;
}

// ─── Calendar API shapes ──────────────────────────────────────────────────────

export interface AvailabilityRequest {
  emails: string[];
  startDateTime: string; // ISO 8601 UTC
  endDateTime: string;   // ISO 8601 UTC
  intervalMinutes?: number; // default 30
}

// ─── Capacity API shapes ──────────────────────────────────────────────────────

export interface CapacitySummaryQuery {
  startDate?: string; // ISO date
  endDate?: string;   // ISO date
}

// ─── Survey / Funnel API shapes ──────────────────────────────────────────────

export interface AssignSurveyRequest {
  issueKey: string;
  ecologistUpn: string;
  surveyDurationDays: number;
  surveyStartDate: string; // YYYY-MM-DD
}

export interface AssignSurveyResponse {
  success: boolean;
  assignment: import("./survey").SurveyAssignment;
}

export interface BulkAssignmentsResponse {
  assignments: import("./survey").SurveyAssignment[];
}

// ─── Generic API error response ───────────────────────────────────────────────

export interface ApiError {
  error: string;
  details?: unknown;
}
