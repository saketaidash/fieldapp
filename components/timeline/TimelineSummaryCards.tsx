"use client";

import { CalendarCheck, CalendarDays, Sun } from "lucide-react";
import type { TimelineSummaryStats } from "@/types/survey";
import { cn } from "@/lib/utils";

interface Props {
  stats: TimelineSummaryStats;
}

const CARDS = [
  {
    key: "totalAssigned" as const,
    label: "Total Assigned",
    icon: CalendarCheck,
    color: "text-blue-600",
    bgColor:
      "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900",
  },
  {
    key: "upcomingThisWeek" as const,
    label: "Upcoming This Week",
    icon: CalendarDays,
    color: "text-amber-600",
    bgColor:
      "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900",
  },
  {
    key: "totalFreeDaysThisMonth" as const,
    label: "Free Days (30d)",
    icon: Sun,
    color: "text-green-600",
    bgColor:
      "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900",
  },
];

export function TimelineSummaryCards({ stats }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CARDS.map(({ key, label, icon: Icon, color, bgColor }) => (
        <div
          key={key}
          className={cn(
            "rounded-xl border p-5 transition-shadow hover:shadow-sm",
            bgColor
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {label}
              </p>
              <p className={cn("mt-1 text-3xl font-bold", color)}>
                {stats[key]}
              </p>
            </div>
            <div className="rounded-lg bg-white/60 dark:bg-black/20 p-2">
              <Icon className={cn("h-5 w-5", color)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
