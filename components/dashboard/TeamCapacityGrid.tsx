"use client";

import type { TeamCapacitySummary } from "@/types/capacity";
import { TeamMemberCard } from "./TeamMemberCard";

interface Props {
  data: TeamCapacitySummary;
}

export function TeamCapacityGrid({ data }: Props) {
  // Sort: overloaded first (highest util), then by name
  const sorted = [...data.people].sort((a, b) => {
    // Overloaded first
    if (a.utilizationPercent > 100 && b.utilizationPercent <= 100) return -1;
    if (b.utilizationPercent > 100 && a.utilizationPercent <= 100) return 1;
    // Then by utilization descending
    return b.utilizationPercent - a.utilizationPercent;
  });

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No team members found
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {sorted.map((person) => (
        <TeamMemberCard key={person.upn} person={person} />
      ))}
    </div>
  );
}
