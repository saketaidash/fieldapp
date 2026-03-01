# CapacityIQ — Field Team Capacity Management Platform

A web platform that pulls **Jira issues via JQL**, checks **Microsoft 365 calendar availability**, and gives a unified view of your field team's capacity.

## Features

| Page | Description |
|---|---|
| **Dashboard** | KPI cards + team workload chart (assigned hours vs available hours) |
| **JQL Explorer** | Run any Jira JQL query, view results with status, priority, story points |
| **Availability** | Color-coded heatmap of who is free/busy/OOO per day |
| **Sprint Capacity** | Pick a sprint, see story points vs calendar availability per person |

---

## Prerequisites

- **Node.js 18+** — install from [nodejs.org](https://nodejs.org)
- A **Jira Cloud** account with API token access
- A **Microsoft 365** tenant with an Azure AD App Registration

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all values:

```env
# Jira
JIRA_BASE_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=service-account@yourcompany.com
JIRA_API_TOKEN=<get from https://id.atlassian.com/manage-profile/security/api-tokens>
JIRA_DEFAULT_BOARD_ID=1
JIRA_STORY_POINTS_FIELD=customfield_10016

# Microsoft 365
AZURE_TENANT_ID=<from Azure portal>
AZURE_CLIENT_ID=<from Azure portal>
AZURE_CLIENT_SECRET=<from Azure portal>

# Team members (comma-separated M365 emails matching Jira assignee emails)
TEAM_MEMBER_UPNS=alice@yourcompany.com,bob@yourcompany.com
```

### 3. Set up Azure AD App Registration

1. Go to [portal.azure.com](https://portal.azure.com) → **Azure Active Directory** → **App Registrations** → **New Registration**
   - Name: `CapacityIQ Service`
   - Supported account types: *Accounts in this organizational directory only*
   - Redirect URI: none

2. **API Permissions** → Add Permission → Microsoft Graph → **Application permissions**:
   - `Calendars.Read`
   - `User.Read.All` (optional, for enriching display names)
   - Click **Grant admin consent**

3. **Certificates & Secrets** → New client secret → copy the value → paste as `AZURE_CLIENT_SECRET`

4. **Overview** tab → copy **Application (client) ID** and **Directory (tenant) ID**

### 4. Get a Jira API Token

1. Go to [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Create a token → copy it → paste as `JIRA_API_TOKEN`
3. Set `JIRA_EMAIL` to the service account email

### 5. Find your Story Points field ID

Story points field ID varies by Jira instance. To find yours:
```
GET https://yourcompany.atlassian.net/rest/api/3/field
```
Look for a field named "Story Points" and note its ID (e.g. `customfield_10016`).

---

## Running

```bash
# Development
npm run dev

# Production build
npm run build && npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## Architecture

```
Browser (React + TanStack Query)
        │
Next.js API Routes          ← All secrets stay server-side
    ├── /api/jira/issues    → Jira REST API (Basic auth)
    ├── /api/jira/sprints   → Jira Agile API
    ├── /api/jira/projects  → Jira REST API
    ├── /api/calendar/availability → Microsoft Graph (Client Credentials OAuth2)
    └── /api/capacity/summary      → Merges both sources
```

### Key files

| File | Purpose |
|---|---|
| `lib/jira/client.ts` | Jira fetch wrapper with Basic auth |
| `lib/jira/issues.ts` | JQL search using POST `/rest/api/3/search/jql` |
| `lib/msgraph/auth.ts` | Azure Client Credentials token acquisition + cache |
| `lib/msgraph/schedule.ts` | `getSchedule` batched calls for free/busy data |
| `lib/capacity/aggregator.ts` | Merges Jira issues + calendar data into capacity view |
| `lib/env.ts` | Zod env validation — fails fast if config is missing |

---

## Notes & Limitations

- **No user authentication** — add [NextAuth.js](https://authjs.dev) with Entra ID before production
- **Story points field** — change `JIRA_STORY_POINTS_FIELD` if your instance uses a different field ID
- **Team email matching** — Jira `assignee.emailAddress` must match M365 UPN exactly
- **Graph date limit** — Microsoft Graph limits `getSchedule` to 62 days
- **Hours per story point** — hardcoded at 4h/SP in `lib/capacity/aggregator.ts`; adjust to your team's velocity
- **Token cache** — in-memory cache works for single process; for multi-instance production use Redis + MSAL Node
