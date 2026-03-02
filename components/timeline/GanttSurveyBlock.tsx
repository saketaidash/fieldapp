"use client";

import type { GanttSurveyBlock as SurveyBlock } from "@/types/survey";
import { cn } from "@/lib/utils";

interface Props {
  block: SurveyBlock;
  /** Number of day-columns this block spans */
  span: number;
  /** Column index where this block starts (1-based for CSS grid) */
  colStart: number;
}

export function GanttSurveyBlock({ block, span, colStart }: Props) {
  return (
    <div
      className={cn(
        "absolute inset-y-1 rounded-md bg-blue-500/90 text-white text-[10px] leading-tight",
        "flex items-center px-1.5 overflow-hidden cursor-default",
        "shadow-sm hover:bg-blue-600 transition-colors z-10"
      )}
      style={{
        gridColumn: `${colStart} / span ${span}`,
      }}
      title={`${block.issueKey}: ${block.issueSummary}\n${block.startDate} to ${block.endDate} (${block.durationDays}d)`}
    >
      <span className="truncate font-medium">{block.issueKey}</span>
    </div>
  );
}
