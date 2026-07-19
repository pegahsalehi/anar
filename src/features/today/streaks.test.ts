import { describe, expect, it } from "vitest";
import { calculateLogDayStats } from "@/features/today/streaks";

describe("calculateLogDayStats", () => {
  it("deduplicates dates and calculates current and longest streaks", () => {
    const stats = calculateLogDayStats(
      [
        "2026-07-18",
        "2026-07-18",
        "2026-07-17",
        "2026-07-15",
        "2026-07-14",
        "2026-07-13",
      ],
      "2026-07-18",
    );

    expect(stats).toMatchObject({
      currentStreak: 2,
      longestStreak: 3,
      activeDays: 5,
    });
    expect(stats.weekDays.map((day) => day.isComplete)).toEqual([
      true,
      true,
      true,
      false,
      true,
      true,
      false,
    ]);
    expect(stats.weekDays[5]).toMatchObject({
      date: "2026-07-18",
      isToday: true,
      label: "S",
    });
  });

  it("returns a zero current streak when today has no log", () => {
    expect(calculateLogDayStats(["2026-07-17"], "2026-07-18")).toMatchObject({
      currentStreak: 0,
      activeDays: 1,
    });
  });
});
