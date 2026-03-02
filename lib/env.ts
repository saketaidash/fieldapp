import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    JIRA_BASE_URL: z.string().url(),
    JIRA_EMAIL: z.string().email(),
    JIRA_API_TOKEN: z.string().min(1),
    JIRA_DEFAULT_BOARD_ID: z.coerce.number().int().positive().default(1),
    JIRA_STORY_POINTS_FIELD: z.string().default("customfield_10016"),
    AZURE_TENANT_ID: z.string().min(1),
    AZURE_CLIENT_ID: z.string().min(1),
    AZURE_CLIENT_SECRET: z.string().min(1),
    TEAM_MEMBER_UPNS: z.string().min(1),
    // Funnel JQL queries — one per pipeline stage
    FUNNEL_JQL_CASES_RECEIVED: z.string().default("project = FIELD ORDER BY created DESC"),
    FUNNEL_JQL_SURVEYS_ASSIGNED: z.string().default("project = FIELD AND status = 'Survey Assigned' ORDER BY created DESC"),
    FUNNEL_JQL_SURVEYS_COMPLETED: z.string().default("project = FIELD AND status = 'Survey Completed' ORDER BY created DESC"),
    FUNNEL_JQL_REPORTS_ISSUED: z.string().default("project = FIELD AND status = 'Report Issued' ORDER BY created DESC"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  experimental__runtimeEnv: process.env,
  // Set SKIP_ENV_VALIDATION=1 to skip validation during CI builds without credentials
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

/** Parse TEAM_MEMBER_UPNS into a trimmed array of UPNs */
export function getTeamUpns(): string[] {
  return env.TEAM_MEMBER_UPNS.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Get the 4 funnel stage configurations */
export function getFunnelStages() {
  return [
    { id: "cases_received" as const, label: "Cases Received", jql: env.FUNNEL_JQL_CASES_RECEIVED },
    { id: "surveys_assigned" as const, label: "Surveys Assigned", jql: env.FUNNEL_JQL_SURVEYS_ASSIGNED },
    { id: "surveys_completed" as const, label: "Surveys Completed", jql: env.FUNNEL_JQL_SURVEYS_COMPLETED },
    { id: "reports_issued" as const, label: "Reports Issued", jql: env.FUNNEL_JQL_REPORTS_ISSUED },
  ];
}
