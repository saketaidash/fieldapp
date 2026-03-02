/**
 * CRUD operations for Jira Issue Properties.
 * Used to store survey assignments (ecologist, duration, dates) on Jira issues.
 * API: /rest/api/3/issue/{issueIdOrKey}/properties/{propertyKey}
 */
import { jiraFetch } from "./client";
import type { SurveyAssignment } from "@/types/survey";
import { JIRA_SURVEY_PROPERTY_KEY } from "@/types/survey";
import { addBusinessDays, format } from "date-fns";

/**
 * GET a survey assignment from a Jira issue property.
 * Returns null if the property has not been set (404).
 */
export async function getSurveyAssignment(
  issueKey: string
): Promise<SurveyAssignment | null> {
  try {
    const data = await jiraFetch<{ key: string; value: SurveyAssignment }>(
      `/api/3/issue/${issueKey}/properties/${JIRA_SURVEY_PROPERTY_KEY}`,
      { revalidate: 0 }
    );
    return data?.value ?? null;
  } catch (err) {
    // 404 means property not set — that's expected for unassigned issues
    if (err instanceof Error && err.message.includes("404")) {
      return null;
    }
    throw err;
  }
}

/**
 * PUT (create or overwrite) a survey assignment on a Jira issue.
 */
export async function setSurveyAssignment(
  issueKey: string,
  assignment: SurveyAssignment
): Promise<void> {
  await jiraFetch<void>(
    `/api/3/issue/${issueKey}/properties/${JIRA_SURVEY_PROPERTY_KEY}`,
    {
      method: "PUT",
      body: JSON.stringify(assignment),
      revalidate: 0,
    }
  );
}

/**
 * DELETE a survey assignment from a Jira issue.
 */
export async function deleteSurveyAssignment(
  issueKey: string
): Promise<void> {
  try {
    await jiraFetch<void>(
      `/api/3/issue/${issueKey}/properties/${JIRA_SURVEY_PROPERTY_KEY}`,
      {
        method: "DELETE",
        revalidate: 0,
      }
    );
  } catch (err) {
    // Ignore 404 on delete (property was already removed)
    if (err instanceof Error && err.message.includes("404")) return;
    throw err;
  }
}

/**
 * Batch-fetch survey assignments for a list of issue keys.
 * Uses Promise.allSettled to handle missing properties gracefully.
 * Processes in parallel batches of 10 to avoid rate-limiting.
 */
export async function getBulkSurveyAssignments(
  issueKeys: string[]
): Promise<Map<string, SurveyAssignment>> {
  const map = new Map<string, SurveyAssignment>();
  const BATCH_SIZE = 10;

  for (let i = 0; i < issueKeys.length; i += BATCH_SIZE) {
    const batch = issueKeys.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (key) => ({
        key,
        assignment: await getSurveyAssignment(key),
      }))
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.assignment) {
        map.set(result.value.key, result.value.assignment);
      }
    }
  }

  return map;
}

/**
 * Create a SurveyAssignment object from input params.
 * Computes endDate from startDate + durationDays (business days).
 */
export function buildSurveyAssignment(params: {
  issueKey: string;
  ecologistUpn: string;
  ecologistDisplayName: string;
  surveyDurationDays: number;
  surveyStartDate: string;
}): SurveyAssignment {
  const startDate = new Date(params.surveyStartDate + "T00:00:00");
  const endDate = addBusinessDays(startDate, Math.max(0, params.surveyDurationDays - 1));

  return {
    issueKey: params.issueKey,
    ecologistUpn: params.ecologistUpn,
    ecologistDisplayName: params.ecologistDisplayName,
    surveyDurationDays: params.surveyDurationDays,
    surveyStartDate: params.surveyStartDate,
    surveyEndDate: format(endDate, "yyyy-MM-dd"),
    assignedAt: new Date().toISOString(),
  };
}
