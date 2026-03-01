export interface JiraAssignee {
  accountId: string;
  displayName: string;
  emailAddress: string;
  avatarUrls: Record<string, string>;
}

export interface JiraStatus {
  name: string;
  statusCategory: {
    key: "new" | "indeterminate" | "done";
    name: string;
    colorName: string;
  };
}

export interface JiraPriority {
  name: string;
  iconUrl: string;
}

export interface JiraIssueType {
  name: string;
  iconUrl: string;
}

export interface JiraSprint {
  id: number;
  name: string;
  state: "active" | "closed" | "future";
  startDate?: string;
  endDate?: string;
  completeDate?: string;
  boardId?: number;
  goal?: string;
}

export interface JiraIssueFields {
  summary: string;
  status: JiraStatus;
  priority: JiraPriority | null;
  assignee: JiraAssignee | null;
  issuetype: JiraIssueType;
  labels: string[];
  updated: string;
  // Story points — field ID varies by instance, configured via env var
  customfield_10016: number | null;
  // Sprint — array of sprint objects
  customfield_10020: JiraSprint[] | null;
  [key: string]: unknown;
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: JiraIssueFields;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  avatarUrls?: Record<string, string>;
}

export interface JiraBoard {
  id: number;
  name: string;
  type: string;
  location?: {
    projectId: number;
    projectKey: string;
    projectName: string;
  };
}

export interface JiraSearchResponse {
  issues: JiraIssue[];
  total: number;
  maxResults: number;
  nextPageToken?: string;
}
