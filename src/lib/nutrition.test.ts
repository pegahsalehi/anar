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
        { calories: 250, protein: 10, carbohydrates: 30 },
        40,
      ),
    ).toEqual({ calories: 100, protein: 4, carbohydrates: 12 });
  });

  it("aggregates totals and clamps progress ratios", () => {
    const totals = aggregateNutrition([
      { calories: 100, protein: 4, carbohydrates: 12 },
      { calories: 150, protein: 6, carbohydrates: 20 },
    ]);

    expect(totals).toEqual({ calories: 250, protein: 10, carbohydrates: 32 });
    expect(
      progressFromTotals(totals, {
        caloriesTarget: 200,
        proteinTarget: 20,
        carbohydratesTarget: 40,
      }),
    ).toMatchObject({
      calories: { consumed: 250, target: 200, exceeded: 50, clampedRatio: 1 },
      protein: { consumed: 10, target: 20, remaining: 10, clampedRatio: 0.5 },
      carbohydrates: {
        consumed: 32,
        target: 40,
        remaining: 8,
        clampedRatio: 0.8,
      },
    });
  });
});
