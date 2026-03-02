import type { JiraIssue } from "./jira";

export interface ReassignmentSuggestion {
  issue: JiraIssue;
  storyPoints: number;
  estimatedHours: number;
  fromUpn: string;
  fromDisplayName: string;
  fromUtilizationBefore: number;
  fromUtilizationAfter: number;
  toUpn: string;
  toDisplayName: string;
  toUtilizationBefore: number;
  toUtilizationAfter: number;
}

export interface ReassignmentAnalysis {
  suggestions: ReassignmentSuggestion[];
  overloadedMembers: number;
  availableMembers: number;
  isBalanced: boolean;
}

/** Thresholds for the reassignment engine */
export const REASSIGNMENT_THRESHOLDS = {
  /** A person is overloaded when utilization exceeds this % */
  OVERLOADED_THRESHOLD: 100,
  /** A person is "available" (can accept tasks) when below this % */
  AVAILABLE_THRESHOLD: 70,
  /** Don't push a target person above this % after reassignment */
  MAX_TARGET_AFTER: 90,
  /** Hours per story point */
  HOURS_PER_SP: 4,
} as const;
