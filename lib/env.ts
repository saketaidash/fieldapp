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
