"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { DayAvailability } from "@/types/capacity";
import { STATUS_LABELS } from "@/lib/utils";

interface Props {
  personName: string;
  day: DayAvailability;
  children: React.ReactNode;
}

export function DayDetailPopover({ personName, day, children }: Props) {
  const [open, setOpen] = useState(false);

  const busyHours = (day.busySlots * 0.5).toFixed(1);
  const freeHours = (day.freeSlots * 0.5).toFixed(1);
  const totalHours = (day.totalSlots * 0.5).toFixed(1);

  return (
    <div className="relative">
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {children}
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-1/2 top-full z-50 mt-1 w-48 -translate-x-1/2 rounded-lg border border-border bg-card p-3 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold truncate">
                {personName}
              </p>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">
              {day.date}
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">
                  {STATUS_LABELS[day.dominantStatus] ?? "Unknown"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Meetings</span>
                <span className="font-medium">{day.meetingCount} ({busyHours}h)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Free</span>
                <span className="font-medium text-green-600">{freeHours}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Free %</span>
                <span className="font-medium">{Math.round(day.freePercent)}%</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
