import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

/** Get array of Date objects between two dates (inclusive) */
export function getDaysBetween(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

/** Group availabilityView string into per-day arrays of slot characters */
export function groupAvailabilityByDay(
  availabilityView: string,
  days: Date[],
  intervalMinutes = 30
): string[] {
  const slotsPerDay = Math.floor((24 * 60) / intervalMinutes);
  return days.map((_, idx) => {
    const start = idx * slotsPerDay;
    const daySlots = availabilityView.slice(start, start + slotsPerDay);
    // Dominant status: most common char in day's slots (excluding empty)
    if (!daySlots) return "0";
    const counts: Record<string, number> = {};
    for (const ch of daySlots) {
      counts[ch] = (counts[ch] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "0";
  });
}

export const STATUS_LABELS: Record<string, string> = {
  "0": "Free",
  "1": "Tentative",
  "2": "Busy",
  "3": "Out of Office",
  "4": "Working Elsewhere",
};
