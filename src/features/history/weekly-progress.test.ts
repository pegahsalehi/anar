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
          calories_min: 1800,
          calories_max: 2000,
          protein_min: 90,
          protein_max: 100,
          carbohydrates_min: 220,
          carbohydrates_max: 250,
          fat_min: 60,
          fat_max: 70,
        },
        {
          effective_date: "2026-07-16",
          calories_target: 1800,
          protein_target: 120,
          carbohydrates_target: 220,
          fat_target: 65,
          calories_min: 1600,
          calories_max: 1800,
          protein_min: 100,
          protein_max: 120,
          carbohydrates_min: 190,
          carbohydrates_max: 220,
          fat_min: 55,
          fat_max: 65,
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
      minTarget: 1800,
      target: 2000,
      maxTarget: 2000,
      completionRatio: 0,
    });
    expect(data.days[1].values.calories).toMatchObject({
      consumed: 200,
      minTarget: 1800,
      target: 2000,
      maxTarget: 2000,
      completionRatio: 0.1,
    });
    expect(data.days[1].values.protein.consumed).toBe(9);
    expect(data.days[3]).toMatchObject({
      date: "2026-07-16",
      isToday: true,
    });
    expect(data.days[3].values.calories.target).toBe(1800);
    expect(data.days[3].values.calories.minTarget).toBe(1600);
  });
});
