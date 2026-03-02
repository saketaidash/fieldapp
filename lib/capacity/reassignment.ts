/**
 * Reassignment suggestion engine.
 * Pure client-side function — runs on TeamCapacitySummary data already fetched.
 *
 * Algorithm:
 * 1. Find overloaded members (utilization > 100%)
 * 2. For each overloaded person, iterate their tasks (smallest SP first)
 * 3. Find the least-utilized available member (< 70%) who would stay < 90% after receiving the task
 * 4. Create a suggestion to move the task
 * 5. Stop suggesting for a person once they drop below 100%
 */

import type { TeamCapacitySummary, PersonCapacity } from "@/types/capacity";
import type { JiraIssue } from "@/types/jira";
import type {
  ReassignmentSuggestion,
  ReassignmentAnalysis,
} from "@/types/reassignment";
import { REASSIGNMENT_THRESHOLDS } from "@/types/reassignment";

const { OVERLOADED_THRESHOLD, AVAILABLE_THRESHOLD, MAX_TARGET_AFTER, HOURS_PER_SP } =
  REASSIGNMENT_THRESHOLDS;

function getStoryPoints(issue: JiraIssue): number {
  const fields = issue.fields as Record<string, unknown>;
  for (const key of [
    "customfield_10016",
    "customfield_10028",
    "customfield_10014",
  ]) {
    const val = fields[key];
    if (typeof val === "number" && val > 0) return val;
  }
  return 0;
}

function getEffectiveCapacity(person: PersonCapacity): number {
  return person.totalWorkingHours - person.meetingHours;
}

function computeUtilization(taskHours: number, effectiveCapacity: number): number {
  if (effectiveCapacity <= 0) return taskHours > 0 ? 200 : 0;
  return Math.round((taskHours / effectiveCapacity) * 100);
}

export function generateReassignmentSuggestions(
  data: TeamCapacitySummary
): ReassignmentAnalysis {
  const suggestions: ReassignmentSuggestion[] = [];

  // Create mutable copies of utilization tracking
  const currentTaskHours = new Map<string, number>();
  for (const p of data.people) {
    currentTaskHours.set(p.upn.toLowerCase(), p.taskHours);
  }

  const getCurrentUtil = (person: PersonCapacity): number => {
    const hours = currentTaskHours.get(person.upn.toLowerCase()) ?? person.taskHours;
    return computeUtilization(hours, getEffectiveCapacity(person));
  };

  // Find overloaded members, sorted by most overloaded first
  const overloaded = data.people
    .filter((p) => getCurrentUtil(p) > OVERLOADED_THRESHOLD)
    .sort((a, b) => getCurrentUtil(b) - getCurrentUtil(a));

  for (const source of overloaded) {
    // Get tasks sorted by SP ascending (move smallest first)
    const tasks = [...source.assignedIssues]
      .map((issue) => ({ issue, sp: getStoryPoints(issue) }))
      .filter((t) => t.sp > 0)
      .sort((a, b) => a.sp - b.sp);

    for (const { issue, sp } of tasks) {
      // If source is no longer overloaded, stop
      if (getCurrentUtil(source) <= OVERLOADED_THRESHOLD) break;

      const taskHours = sp * HOURS_PER_SP;

      // Find best target: least utilized person who is "available" and stays under MAX_TARGET_AFTER
      const candidates = data.people
        .filter((p) => {
          if (p.upn.toLowerCase() === source.upn.toLowerCase()) return false;
          const util = getCurrentUtil(p);
          if (util >= AVAILABLE_THRESHOLD) return false;
          // Check if adding task would push them over MAX_TARGET_AFTER
          const currentHours = currentTaskHours.get(p.upn.toLowerCase()) ?? p.taskHours;
          const newUtil = computeUtilization(
            currentHours + taskHours,
            getEffectiveCapacity(p)
          );
          return newUtil <= MAX_TARGET_AFTER;
        })
        .sort((a, b) => getCurrentUtil(a) - getCurrentUtil(b));

      if (candidates.length === 0) continue;

      const target = candidates[0];
      const sourceKey = source.upn.toLowerCase();
      const targetKey = target.upn.toLowerCase();

      const sourceHoursBefore = currentTaskHours.get(sourceKey)!;
      const targetHoursBefore = currentTaskHours.get(targetKey)!;
      const sourceUtilBefore = getCurrentUtil(source);
      const targetUtilBefore = getCurrentUtil(target);

      // Apply the reassignment
      currentTaskHours.set(sourceKey, sourceHoursBefore - taskHours);
      currentTaskHours.set(targetKey, targetHoursBefore + taskHours);

      suggestions.push({
        issue,
        storyPoints: sp,
        estimatedHours: taskHours,
        fromUpn: source.upn,
        fromDisplayName: source.displayName,
        fromUtilizationBefore: sourceUtilBefore,
        fromUtilizationAfter: getCurrentUtil(source),
        toUpn: target.upn,
        toDisplayName: target.displayName,
        toUtilizationBefore: targetUtilBefore,
        toUtilizationAfter: getCurrentUtil(target),
      });
    }
  }

  const overloadedMembers = data.people.filter(
    (p) => p.utilizationPercent > OVERLOADED_THRESHOLD
  ).length;
  const availableMembers = data.people.filter(
    (p) => p.utilizationPercent < AVAILABLE_THRESHOLD
  ).length;

  return {
    suggestions,
    overloadedMembers,
    availableMembers,
    isBalanced: overloadedMembers === 0,
  };
}
