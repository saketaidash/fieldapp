"use client";

import { Inbox, UserCheck, ClipboardCheck, FileText } from "lucide-react";
import type { FunnelStage } from "@/types/survey";
import { cn } from "@/lib/utils";

interface Props {
  stages: FunnelStage[];
}

const STAGE_CONFIG: Record<
  string,
  { icon: typeof Inbox; color: string; bgColor: string }
> = {
  cases_received: {
    icon: Inbox,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900",
  },
  surveys_assigned: {
    icon: UserCheck,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900",
  },
  surveys_completed: {
    icon: ClipboardCheck,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900",
  },
  reports_issued: {
    icon: FileText,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900",
  },
};

export function FunnelStageCards({ stages }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stages.map((stage, idx) => {
        const config = STAGE_CONFIG[stage.id] ?? {
          icon: Inbox,
          color: "text-muted-foreground",
          bgColor: "bg-card",
        };
        const Icon = config.icon;

        return (
          <div
            key={stage.id}
            className={cn(
              "rounded-xl border p-5 transition-shadow hover:shadow-sm",
              config.bgColor
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stage.label}
                </p>
                <p className={cn("mt-1 text-3xl font-bold", config.color)}>
                  {stage.count}
                </p>
              </div>
              <div className="rounded-lg bg-white/60 dark:bg-black/20 p-2">
                <Icon className={cn("h-5 w-5", config.color)} />
              </div>
            </div>
            {/* Arrow indicator between cards */}
            {idx < stages.length - 1 && (
              <div className="hidden lg:block absolute -right-3 top-1/2 text-muted-foreground/40 text-lg">
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
