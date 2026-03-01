"use client";

import type { JiraSprint, JiraBoard } from "@/types/jira";
import { formatDate } from "@/lib/utils";

interface Props {
  boards: JiraBoard[];
  sprints: JiraSprint[];
  selectedBoardId: number | null;
  selectedSprintId: number | null;
  onBoardChange: (boardId: number) => void;
  onSprintChange: (sprintId: number) => void;
  isLoadingSprints?: boolean;
}

export function SprintPicker({
  boards,
  sprints,
  selectedBoardId,
  selectedSprintId,
  onBoardChange,
  onSprintChange,
  isLoadingSprints,
}: Props) {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Board selector */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Board</label>
        <select
          value={selectedBoardId ?? ""}
          onChange={(e) => onBoardChange(Number(e.target.value))}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
        >
          <option value="" disabled>Select a board…</option>
          {boards.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sprint selector */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Sprint</label>
        <select
          value={selectedSprintId ?? ""}
          onChange={(e) => onSprintChange(Number(e.target.value))}
          disabled={!selectedBoardId || isLoadingSprints}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[260px] disabled:opacity-50"
        >
          <option value="" disabled>
            {isLoadingSprints ? "Loading sprints…" : "Select a sprint…"}
          </option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.state === "active" ? " (Active)" : ""}
              {s.startDate ? ` — ${formatDate(s.startDate)}` : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
