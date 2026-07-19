import { describe, expect, it } from "vitest";
import { calculateLogDayStats } from "@/features/today/streaks";

describe("calculateLogDayStats", () => {
  it("deduplicates dates and calculates current and longest streaks", () => {
    expect(
      calculateLogDayStats(
        [
          "2026-07-18",
          "2026-07-18",
          "2026-07-17",
          "2026-07-15",
          "2026-07-14",
          "2026-07-13",
        ],
        "2026-07-18",
      ),
    ).toEqual({
      currentStreak: 2,
      longestStreak: 3,
      activeDays: 5,
    });
  });

  it("returns a zero current streak when today has no log", () => {
    expect(calculateLogDayStats(["2026-07-17"], "2026-07-18")).toMatchObject({
      currentStreak: 0,
      activeDays: 1,
    });
  });
});
