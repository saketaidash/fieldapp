"use client";

import { cn } from "@/lib/utils";

interface Props {
  percent: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UtilizationBadge({ percent, size = "md", className }: Props) {
  const label = `${percent}%`;

  let colorClasses: string;
  let statusLabel: string;

  if (percent > 100) {
    colorClasses = "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
    statusLabel = "Overloaded";
  } else if (percent > 80) {
    colorClasses = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400";
    statusLabel = "High";
  } else if (percent > 50) {
    colorClasses = "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
    statusLabel = "Balanced";
  } else {
    colorClasses = "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
    statusLabel = "Available";
  }

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-0.5 text-xs",
    lg: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold",
        colorClasses,
        sizeClasses[size],
        className
      )}
      title={statusLabel}
    >
      {label}
    </span>
  );
}
