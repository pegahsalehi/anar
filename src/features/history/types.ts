export type WeeklyProgressMetric = "calories" | "protein" | "carbohydrates" | "fat";
export type WeeklyProgressRangeStatus = "below" | "inside" | "above";

export type WeeklyProgressMetricValue = {
  consumed: number;
  minTarget: number;
  target: number;
  maxTarget: number;
  completionRatio: number;
  rangeStatus: WeeklyProgressRangeStatus;
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
  days: WeeklyProgressDay[];
};
