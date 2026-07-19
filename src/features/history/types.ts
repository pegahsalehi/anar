import type { WeekStartsOn } from "@/lib/dates";

export type WeeklyProgressMetric = "calories" | "protein" | "carbohydrates" | "fat";
export type WeeklyProgressTargetStatus = "below" | "reached" | "above";

export type WeeklyProgressMetricValue = {
  consumed: number;
  target: number;
  completionRatio: number;
  targetStatus: WeeklyProgressTargetStatus;
};

export type WeeklyProgressDay = {
  date: string;
  shortLabel: "M" | "T" | "W" | "F" | "S";
  label: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  isToday: boolean;
  values: Record<WeeklyProgressMetric, WeeklyProgressMetricValue>;
};

export type WeeklyProgressData = {
  weekStart: string;
  weekEnd: string;
  previousWeekStart: string;
  nextWeekStart: string;
  weekStartsOn: WeekStartsOn;
  days: WeeklyProgressDay[];
};
