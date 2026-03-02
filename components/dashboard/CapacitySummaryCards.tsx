import { AlertTriangle, UserCheck, TrendingUp, CircleDot } from "lucide-react";
import type { TeamCapacitySummary } from "@/types/capacity";
import { cn } from "@/lib/utils";

interface Props {
  data: TeamCapacitySummary;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bgColor,
}: {
  icon: typeof AlertTriangle;
  label: string;
  value: string;
  sub?: string;
  color?: string;
  bgColor?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border p-5", bgColor ?? "bg-card")}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className={cn("mt-1 text-2xl font-bold", color)}>{value}</p>
          {sub && (
            <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
          )}
        </div>
        <div className="rounded-lg bg-muted p-2">
          <Icon className={cn("h-5 w-5", color ?? "text-muted-foreground")} />
        </div>
      </div>
    </div>
  );
}

export function CapacitySummaryCards({ data }: Props) {
  const avgUtil = data.averageUtilization;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        icon={AlertTriangle}
        label="Overloaded"
        value={String(data.overloadedCount)}
        sub="members over 100% capacity"
        color={
          data.overloadedCount > 0 ? "text-red-600" : "text-green-600"
        }
        bgColor={
          data.overloadedCount > 0
            ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
            : "bg-card"
        }
      />
      <KpiCard
        icon={UserCheck}
        label="Available"
        value={String(data.availableCount)}
        sub="members under 70% capacity"
        color="text-blue-600"
        bgColor="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
      />
      <KpiCard
        icon={TrendingUp}
        label="Avg Utilization"
        value={`${avgUtil}%`}
        sub="tasks vs available capacity"
        color={
          avgUtil > 100
            ? "text-red-600"
            : avgUtil > 80
            ? "text-yellow-600"
            : "text-green-600"
        }
      />
      <KpiCard
        icon={CircleDot}
        label="Unassigned"
        value={String(data.unassignedIssueCount)}
        sub="issues without an owner"
        color={data.unassignedIssueCount > 0 ? "text-orange-600" : "text-muted-foreground"}
      />
    </div>
  );
}
