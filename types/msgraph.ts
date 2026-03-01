export type AvailabilityStatus =
  | "0" // Free
  | "1" // Tentative
  | "2" // Busy
  | "3" // Out of office
  | "4"; // Working elsewhere

export interface ScheduleDateTime {
  dateTime: string; // ISO 8601
  timeZone: string;
}

export interface ScheduleItem {
  status: "free" | "tentative" | "busy" | "oof" | "workingElsewhere" | "unknown";
  subject?: string;
  location?: string;
  isMeeting?: boolean;
  isRecurring?: boolean;
  start: ScheduleDateTime;
  end: ScheduleDateTime;
}

export interface WorkingHours {
  daysOfWeek: string[];
  startTime: string; // e.g. "08:00:00.0000000"
  endTime: string;
  timeZone: { name: string };
}

export interface ScheduleResponse {
  scheduleId: string; // The UPN (email) of the user
  availabilityView: string; // e.g. "0020002222000"  one char per interval
  scheduleItems: ScheduleItem[];
  workingHours: WorkingHours;
}

export interface GraphScheduleRequest {
  schedules: string[];
  startTime: ScheduleDateTime;
  endTime: ScheduleDateTime;
  availabilityViewInterval: number; // minutes (15, 30, or 60)
}

export interface GraphScheduleResponse {
  value: ScheduleResponse[];
}
