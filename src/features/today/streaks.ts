export type LogDayStats = {
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  weekDays: WeekDayActivity[];
};

export type WeekDayActivity = {
  label: "M" | "T" | "W" | "F" | "S";
  date: string;
  isComplete: boolean;
  isToday: boolean;
};

const weekDayLabels: WeekDayActivity["label"][] = ["M", "T", "W", "T", "F", "S", "S"];

export function calculateLogDayStats(
  logDates: Array<string | null | undefined>,
  today: string,
): LogDayStats {
  const uniqueDates = new Set(
    logDates.filter((date): date is string => Boolean(date)),
  );

  const sortedDates = Array.from(uniqueDates).sort();
  let longestStreak = 0;
  let runningStreak = 0;
  let previousDate: string | null = null;

  sortedDates.forEach((date) => {
    runningStreak =
      previousDate && previousISODate(date) === previousDate ? runningStreak + 1 : 1;
    longestStreak = Math.max(longestStreak, runningStreak);
    previousDate = date;
  });

  let currentStreak = 0;
  let cursor = today;

  while (uniqueDates.has(cursor)) {
    currentStreak += 1;
    cursor = previousISODate(cursor);
  }

  return {
    currentStreak,
    longestStreak,
    activeDays: uniqueDates.size,
    weekDays: buildWeekDays(uniqueDates, today),
  };
}

function previousISODate(value: string) {
  return addISODays(value, -1);
}

function buildWeekDays(uniqueDates: Set<string>, today: string): WeekDayActivity[] {
  const todayDate = new Date(`${today}T00:00:00.000Z`);
  const mondayOffset = (todayDate.getUTCDay() + 6) % 7;
  const monday = addISODays(today, -mondayOffset);

  return weekDayLabels.map((label, index) => {
    const date = addISODays(monday, index);

    return {
      label,
      date,
      isComplete: uniqueDates.has(date),
      isToday: date === today,
    };
  });
}

function addISODays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
