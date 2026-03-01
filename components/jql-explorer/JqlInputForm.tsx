"use client";

import { useState } from "react";
import { Search, Play } from "lucide-react";

interface Props {
  onSearch: (jql: string) => void;
  isLoading?: boolean;
}

const QUICK_FILTERS = [
  { label: "Open Sprint", jql: "sprint in openSprints() AND statusCategory != Done" },
  { label: "Unassigned", jql: "assignee is EMPTY AND statusCategory != Done" },
  { label: "High Priority", jql: "priority in (Highest, High) AND statusCategory != Done" },
  { label: "My Team", jql: "assignee in membersOf(\"your-team\") AND statusCategory != Done" },
];

export function JqlInputForm({ onSearch, isLoading }: Props) {
  const [jql, setJql] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jql.trim()) onSearch(jql.trim());
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <textarea
            value={jql}
            onChange={(e) => setJql(e.target.value)}
            placeholder='e.g. project = "FIELD" AND sprint in openSprints() AND assignee is not EMPTY'
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if (jql.trim()) onSearch(jql.trim());
              }
            }}
          />
        </div>
        <button
          type="submit"
          disabled={!jql.trim() || isLoading}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          {isLoading ? "Running..." : "Run"}
        </button>
      </form>

      {/* Quick filter chips */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center">Quick filters:</span>
        {QUICK_FILTERS.map(({ label, jql: q }) => (
          <button
            key={label}
            onClick={() => {
              setJql(q);
              onSearch(q);
            }}
            className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: Press <kbd className="rounded border border-border px-1 font-mono text-xs">Ctrl+Enter</kbd> to run
      </p>
    </div>
  );
}
