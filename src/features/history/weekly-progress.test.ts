import { describe, expect, it } from "vitest";
import {
  buildWeeklyProgressData,
  resolveHistoryWeekStart,
} from "@/features/history/weekly-progress";

describe("weekly progress", () => {
  it("normalizes requested weeks to Monday", () => {
    expect(resolveHistoryWeekStart("2026-07-19", "2026-07-19")).toBe(
      "2026-07-13",
    );
    expect(resolveHistoryWeekStart("not-a-date", "2026-07-19")).toBe(
      "2026-07-13",
    );
  });

  it("normalizes requested weeks to Sunday when preferred", () => {
    expect(resolveHistoryWeekStart("2026-07-19", "2026-07-19", "sunday")).toBe(
      "2026-07-19",
    );
    expect(resolveHistoryWeekStart("not-a-date", "2026-07-20", "sunday")).toBe(
      "2026-07-19",
    );
  });

  it("builds Monday-Sunday progress with zero days, targets, and totals", () => {
    const data = buildWeeklyProgressData({
      today: "2026-07-16",
      weekStart: "2026-07-13",
      goals: [
        {
          effective_date: "2026-07-01",
          calories_target: 2000,
          protein_target: 100,
          carbohydrates_target: 250,
          fat_target: 70,
        },
        {
          effective_date: "2026-07-16",
          calories_target: 1800,
          protein_target: 120,
          carbohydrates_target: 220,
          fat_target: 65,
        },
      ],
      logs: [
        {
          local_log_date: "2026-07-14",
          consumed_grams: 50,
          calories_per_100g_snapshot: 200,
          protein_per_100g_snapshot: 10,
          carbohydrates_per_100g_snapshot: 20,
          fat_per_100g_snapshot: 5,
        },
        {
          local_log_date: "2026-07-14",
          consumed_grams: 100,
          calories_per_100g_snapshot: 100,
          protein_per_100g_snapshot: 4,
          carbohydrates_per_100g_snapshot: 15,
          fat_per_100g_snapshot: 2,
        },
        {
          local_log_date: "2026-07-16",
          consumed_grams: 100,
          calories_per_100g_snapshot: 1800,
          protein_per_100g_snapshot: 110,
          carbohydrates_per_100g_snapshot: 205,
          fat_per_100g_snapshot: 60,
        },
        {
          local_log_date: "2026-07-17",
          consumed_grams: 100,
          calories_per_100g_snapshot: 1900,
          protein_per_100g_snapshot: 130,
          carbohydrates_per_100g_snapshot: 240,
          fat_per_100g_snapshot: 75,
        },
      ],
    });

    expect(data.weekStart).toBe("2026-07-13");
    expect(data.weekEnd).toBe("2026-07-19");
    expect(data.previousWeekStart).toBe("2026-07-06");
    expect(data.nextWeekStart).toBe("2026-07-20");
    expect(data.days.map((day) => day.label)).toEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ]);

    expect(data.days[0].values.calories).toMatchObject({
      consumed: 0,
      target: 2000,
      completionRatio: 0,
      targetStatus: "below",
    });
    expect(data.days[1].values.calories).toMatchObject({
      consumed: 200,
      target: 2000,
      completionRatio: 0.1,
      targetStatus: "below",
    });
    expect(data.days[1].values.protein.consumed).toBe(9);
    expect(data.days[3]).toMatchObject({
      date: "2026-07-16",
      isToday: true,
    });
    expect(data.days[3].values.calories.target).toBe(1800);
    expect(data.days[3].values.calories.targetStatus).toBe("reached");
    expect(data.days[4].values.calories.targetStatus).toBe("above");
  });

  it("builds Sunday-Saturday progress when requested", () => {
    const data = buildWeeklyProgressData({
      today: "2026-07-20",
      weekStartsOn: "sunday",
      weekStart: "2026-07-20",
      goals: [],
      logs: [],
    });

    expect(data.weekStartsOn).toBe("sunday");
    expect(data.weekStart).toBe("2026-07-19");
    expect(data.weekEnd).toBe("2026-07-25");
    expect(data.days.map((day) => day.label)).toEqual([
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]);
  });
});
