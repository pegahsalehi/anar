type LogDayStats = {
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
};

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
  };
}

function previousISODate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
