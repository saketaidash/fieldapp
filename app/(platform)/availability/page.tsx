"use client";

import { useState } from "react";
import { addDays, format } from "date-fns";
import { Calendar } from "lucide-react";
import { useAvailability } from "@/hooks/useAvailability";
import { AvailabilityHeatmap } from "@/components/availability/AvailabilityHeatmap";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorAlert } from "@/components/shared/ErrorAlert";
import type { PersonAvailability } from "@/types/capacity";

const toIso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");

export default function AvailabilityPage() {
  const today = new Date();
  const [startDate, setStartDate] = useState(format(today, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(addDays(today, 13), "yyyy-MM-dd"));
  const [availability, setAvailability] = useState<PersonAvailability[]>([]);
  const [fetched, setFetched] = useState(false);

  const { mutate, isPending, error } = useAvailability();

  const handleFetch = () => {
    const start = new Date(startDate + "T00:00:00Z");
    const end = new Date(endDate + "T23:59:59Z");

    // Validate 62-day Graph limit
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 62) {
      alert("Microsoft Graph limits calendar lookups to 62 days. Please shorten the date range.");
      return;
    }

    mutate(
      {
        emails: [], // will be populated server-side from TEAM_MEMBER_UPNS
        startDateTime: toIso(start),
        endDateTime: toIso(end),
        intervalMinutes: 30,
      },
      {
        onSuccess: (data) => {
          setAvailability(data.availability);
          setFetched(true);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          View when each team member is free, busy, or out of office based on their Outlook calendar.
        </p>
      </div>

      {/* Date Range Controls */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">End Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={handleFetch}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Calendar className="h-4 w-4" />
            {isPending ? "Fetching…" : "Fetch Availability"}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Max range: 62 days (Microsoft Graph limit). Uses team members from TEAM_MEMBER_UPNS config.
        </p>
      </div>

      {error && <ErrorAlert message={error.message} />}

      {isPending && <LoadingSpinner text="Fetching calendar data from Microsoft 365…" />}

      {!isPending && fetched && (
        <div className="rounded-xl border border-border bg-card p-5">
          <AvailabilityHeatmap
            availability={availability}
            startDate={new Date(startDate)}
            endDate={new Date(endDate)}
          />
        </div>
      )}
    </div>
  );
}
