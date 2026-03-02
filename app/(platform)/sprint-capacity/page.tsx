"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useBoards, useSprints } from "@/hooks/useSprints";
import { useJiraIssues } from "@/hooks/useJiraIssues";
import { useAvailability } from "@/hooks/useAvailability";
import { SprintPicker } from "@/components/sprint-capacity/SprintPicker";
import { CapacityBars } from "@/components/sprint-capacity/CapacityBars";
import { PersonCapacityRow } from "@/components/sprint-capacity/PersonCapacityRow";
import { ReassignmentPanel } from "@/components/dashboard/ReassignmentPanel";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import { EmptyState } from "@/components/shared/EmptyState";
import { BarChart3 } from "lucide-react";
import type { JiraSprint } from "@/types/jira";
import type { TeamCapacitySummary } from "@/types/capacity";
import { mergeCapacityClient } from "@/lib/capacity/client-aggregator";

export default function SprintCapacityPage() {
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<JiraSprint | null>(
    null
  );
  const [capacitySummary, setCapacitySummary] =
    useState<TeamCapacitySummary | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const { data: boardsData, isLoading: isLoadingBoards } = useBoards();
  const { data: sprintsData, isLoading: isLoadingSprints } =
    useSprints(selectedBoardId);

  const { mutateAsync: searchIssues } = useJiraIssues();
  const { mutateAsync: fetchAvailability } = useAvailability();

  const handleSprintSelect = async (sprintId: number) => {
    const sprint = sprintsData?.sprints.find((s) => s.id === sprintId);
    if (!sprint) return;
    setSelectedSprint(sprint);
    setCapacitySummary(null);
    setIsFetching(true);

    try {
      const sprintStart = sprint.startDate
        ? new Date(sprint.startDate).toISOString()
        : new Date().toISOString();
      const sprintEnd = sprint.endDate
        ? new Date(sprint.endDate).toISOString()
        : new Date(Date.now() + 14 * 86400000).toISOString();

      const [issuesData, availData] = await Promise.all([
        searchIssues({
          jql: `sprint = ${sprint.id} AND statusCategory != Done`,
          maxResults: 100,
        }),
        fetchAvailability({
          emails: [],
          startDateTime: sprintStart,
          endDateTime: sprintEnd,
          intervalMinutes: 30,
        }),
      ]);

      const upns = availData.availability.map((a) => a.upn);
      const summary = mergeCapacityClient(
        issuesData.issues,
        availData.availability,
        upns,
        sprintStart,
        sprintEnd
      );
      setCapacitySummary(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleBoardChange = (boardId: number) => {
    setSelectedBoardId(boardId);
    setSelectedSprint(null);
    setCapacitySummary(null);
  };

  if (isLoadingBoards) return <LoadingSpinner text="Loading boards..." />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Select a sprint to see how story points align with team calendar
          availability. Meetings reduce effective capacity.
        </p>
      </div>

      {/* Sprint Picker */}
      <div className="rounded-xl border border-border bg-card p-5">
        <SprintPicker
          boards={boardsData?.boards ?? []}
          sprints={sprintsData?.sprints ?? []}
          selectedBoardId={selectedBoardId}
          selectedSprintId={selectedSprint?.id ?? null}
          onBoardChange={handleBoardChange}
          onSprintChange={handleSprintSelect}
          isLoadingSprints={isLoadingSprints}
        />
      </div>

      {isFetching && (
        <LoadingSpinner text="Fetching sprint issues and calendar data..." />
      )}

      {!isFetching && capacitySummary && (
        <>
          {/* Sprint info bar */}
          {selectedSprint && (
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
              <span className="font-medium">{selectedSprint.name}</span>
              {selectedSprint.startDate && (
                <span className="ml-2 text-muted-foreground">
                  {format(new Date(selectedSprint.startDate), "MMM d")} →{" "}
                  {selectedSprint.endDate
                    ? format(new Date(selectedSprint.endDate), "MMM d, yyyy")
                    : "ongoing"}
                </span>
              )}
              <span
                className={`ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  selectedSprint.state === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {selectedSprint.state}
              </span>
            </div>
          )}

          {/* Capacity Chart — stacked bars */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold">
              Sprint Capacity Overview
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                Meetings + Tasks + Free
              </span>
            </h2>
            <CapacityBars data={capacitySummary} />
          </div>

          {/* Reassignment Panel */}
          <div className="rounded-xl border border-border bg-card p-5">
            <ReassignmentPanel data={capacitySummary} />
          </div>

          {/* Per-person breakdown */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">
              Team Breakdown
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                sorted by utilization
              </span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {capacitySummary.people
                .sort((a, b) => b.utilizationPercent - a.utilizationPercent)
                .map((person) => (
                  <PersonCapacityRow key={person.upn} person={person} />
                ))}
            </div>
          </div>
        </>
      )}

      {!isFetching && !capacitySummary && selectedBoardId && (
        <EmptyState
          icon={BarChart3}
          title="Select a sprint to view capacity"
          description="Choose a sprint from the picker above to see the team's capacity for that sprint."
        />
      )}
    </div>
  );
}
