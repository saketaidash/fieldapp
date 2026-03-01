import type { PersonCapacity } from "@/types/capacity";
import { cn } from "@/lib/utils";

interface Props {
  person: PersonCapacity;
}

export function PersonCapacityRow({ person }: Props) {
  const util = Math.round(person.utilizationPercent);
  const barWidth = Math.min(util, 100);

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {person.displayName.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium">{person.displayName}</p>
          <span
            className={cn(
              "shrink-0 text-sm font-semibold",
              util > 100 ? "text-destructive" : util > 80 ? "text-yellow-600" : "text-green-600"
            )}
          >
            {util}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              util > 100 ? "bg-destructive" : util > 80 ? "bg-yellow-500" : "bg-green-500"
            )}
            style={{ width: `${barWidth}%` }}
          />
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
          <span>{person.issueCount} issues</span>
          <span>{person.totalStoryPoints} SP</span>
          <span>{Math.round(person.totalStoryPoints * 4)}h estimated</span>
          <span>{Math.round(person.availableHours)}h available</span>
        </div>
      </div>
    </div>
  );
}
