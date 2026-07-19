export type NutritionValues = {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
};

export type NutritionTargets = {
  caloriesMinTarget: number;
  caloriesTarget: number;
  proteinMinTarget: number;
  proteinTarget: number;
  carbohydratesMinTarget: number;
  carbohydratesTarget: number;
  fatMinTarget: number;
  fatTarget: number;
};

export type NutritionProgress = {
  consumed: number;
  minTarget: number;
  target: number;
  maxTarget: number;
  remainingToMin: number;
  remaining: number;
  exceeded: number;
  isWithinRange: boolean;
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
  caloriesMinTarget: 2000,
  caloriesTarget: 2000,
  proteinMinTarget: 100,
  proteinTarget: 100,
  carbohydratesMinTarget: 250,
  carbohydratesTarget: 250,
  fatMinTarget: 70,
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

export function calculateProgress(
  consumed: number,
  target: number,
  minTarget = target,
): NutritionProgress {
  const safeMinTarget = Math.max(minTarget, 0);
  const safeMaxTarget = Math.max(target, safeMinTarget, 0);
  const ratio = safeMaxTarget > 0 ? consumed / safeMaxTarget : 0;

  return {
    consumed,
    minTarget: safeMinTarget,
    target: safeMaxTarget,
    maxTarget: safeMaxTarget,
    remainingToMin: Math.max(safeMinTarget - consumed, 0),
    remaining: Math.max(safeMaxTarget - consumed, 0),
    exceeded: Math.max(consumed - safeMaxTarget, 0),
    isWithinRange: consumed >= safeMinTarget && consumed <= safeMaxTarget,
    ratio,
    clampedRatio: Math.min(Math.max(ratio, 0), 1),
  };
}

export function progressFromTotals(
  totals: NutritionValues,
  targets: NutritionTargets,
): DailyNutritionProgress {
  return {
    calories: calculateProgress(
      totals.calories,
      targets.caloriesTarget,
      targets.caloriesMinTarget,
    ),
    protein: calculateProgress(
      totals.protein,
      targets.proteinTarget,
      targets.proteinMinTarget,
    ),
    carbohydrates: calculateProgress(
      totals.carbohydrates,
      targets.carbohydratesTarget,
      targets.carbohydratesMinTarget,
    ),
    fat: calculateProgress(
      totals.fat,
      targets.fatTarget,
      targets.fatMinTarget,
    ),
  };
}
