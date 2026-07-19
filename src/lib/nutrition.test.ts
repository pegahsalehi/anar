import { describe, expect, it } from "vitest";
import {
  aggregateNutrition,
  calculateConsumedNutrition,
  progressFromTotals,
} from "@/lib/nutrition";

describe("nutrition helpers", () => {
  it("calculates consumed nutrition from per-100g values", () => {
    expect(
      calculateConsumedNutrition(
        { calories: 250, protein: 10, carbohydrates: 30, fat: 8 },
        40,
      ),
    ).toEqual({ calories: 100, protein: 4, carbohydrates: 12, fat: 3.2 });
  });

  it("aggregates totals and clamps progress ratios", () => {
    const totals = aggregateNutrition([
      { calories: 100, protein: 4, carbohydrates: 12, fat: 3.2 },
      { calories: 150, protein: 6, carbohydrates: 20, fat: 5.8 },
    ]);

    expect(totals).toEqual({ calories: 250, protein: 10, carbohydrates: 32, fat: 9 });
    expect(
      progressFromTotals(totals, {
        caloriesMinTarget: 150,
        caloriesTarget: 200,
        proteinMinTarget: 15,
        proteinTarget: 20,
        carbohydratesMinTarget: 30,
        carbohydratesTarget: 40,
        fatMinTarget: 8,
        fatTarget: 10,
      }),
    ).toMatchObject({
      calories: { consumed: 250, minTarget: 150, target: 200, exceeded: 50, clampedRatio: 1 },
      protein: {
        consumed: 10,
        minTarget: 15,
        target: 20,
        remainingToMin: 5,
        remaining: 10,
        clampedRatio: 0.5,
      },
      carbohydrates: {
        consumed: 32,
        minTarget: 30,
        target: 40,
        remaining: 8,
        isWithinRange: true,
        clampedRatio: 0.8,
      },
      fat: { consumed: 9, minTarget: 8, target: 10, remaining: 1, clampedRatio: 0.9 },
    });
  });
});
