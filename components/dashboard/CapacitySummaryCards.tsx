import { Users, CheckSquare, TrendingUp, AlertTriangle } from "lucide-react";
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
}: {
  icon: typeof Users;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn("mt-1 text-2xl font-bold", color)}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className="rounded-lg bg-muted p-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

export function CapacitySummaryCards({ data }: Props) {
  const avgUtil = Math.round(data.averageUtilization);
  const overloadedCount = data.people.filter((p) => p.utilizationPercent > 100).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        icon={Users}
        label="Team Members"
        value={String(data.people.length)}
        sub="tracked this sprint"
      />
      <KpiCard
        icon={CheckSquare}
        label="Open Issues"
        value={String(data.totalIssues)}
        sub={`${data.totalStoryPoints} story points total`}
      />
      <KpiCard
        icon={TrendingUp}
        label="Avg Utilization"
        value={`${avgUtil}%`}
        sub="assigned points vs capacity"
        color={
          avgUtil > 100
            ? "text-destructive"
            : avgUtil > 80
            ? "text-yellow-600"
            : "text-green-600"
        }
      />
      <KpiCard
        icon={AlertTriangle}
        label="Overloaded"
        value={String(overloadedCount)}
        sub="members over 100% capacity"
        color={overloadedCount > 0 ? "text-destructive" : "text-green-600"}
      />
    </div>
  );
}
