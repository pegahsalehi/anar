export type NutritionValues = {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
};

export type NutritionTargets = {
  caloriesTarget: number;
  proteinTarget: number;
  carbohydratesTarget: number;
  fatTarget: number;
};

export type NutritionProgress = {
  consumed: number;
  target: number;
  remaining: number;
  exceeded: number;
  ratio: number;
  clampedRatio: number;
};

export type DailyNutritionProgress = {
  calories: NutritionProgress;
  protein: NutritionProgress;
  carbohydrates: NutritionProgress;
  fat: NutritionProgress;
};

export const defaultDailyGoals: NutritionTargets = {
  caloriesTarget: 2000,
  proteinTarget: 100,
  carbohydratesTarget: 250,
  fatTarget: 70,
};

export function calculateConsumedNutrition(
  per100g: NutritionValues,
  grams: number,
): NutritionValues {
  return {
    calories: (per100g.calories * grams) / 100,
    protein: (per100g.protein * grams) / 100,
    carbohydrates: (per100g.carbohydrates * grams) / 100,
    fat: (per100g.fat * grams) / 100,
  };
}

export function aggregateNutrition(values: NutritionValues[]): NutritionValues {
  return values.reduce<NutritionValues>(
    (total, value) => ({
      calories: total.calories + value.calories,
      protein: total.protein + value.protein,
      carbohydrates: total.carbohydrates + value.carbohydrates,
      fat: total.fat + value.fat,
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
  );
}

export function calculateProgress(consumed: number, target: number): NutritionProgress {
  const safeTarget = target > 0 ? target : 0;
  const ratio = safeTarget > 0 ? consumed / safeTarget : 0;

  return {
    consumed,
    target: safeTarget,
    remaining: Math.max(safeTarget - consumed, 0),
    exceeded: Math.max(consumed - safeTarget, 0),
    ratio,
    clampedRatio: Math.min(Math.max(ratio, 0), 1),
  };
}

export function progressFromTotals(
  totals: NutritionValues,
  targets: NutritionTargets,
): DailyNutritionProgress {
  return {
    calories: calculateProgress(totals.calories, targets.caloriesTarget),
    protein: calculateProgress(totals.protein, targets.proteinTarget),
    carbohydrates: calculateProgress(
      totals.carbohydrates,
      targets.carbohydratesTarget,
    ),
    fat: calculateProgress(totals.fat, targets.fatTarget),
  };
}
