import {
  addISODays,
  getISOWeekDays,
  isISODate,
  startOfISOWeek,
} from "@/lib/dates";
import {
  aggregateNutrition,
  calculateConsumedNutrition,
  defaultDailyGoals,
  type NutritionTargets,
  type NutritionValues,
} from "@/lib/nutrition";
import type {
  WeeklyProgressData,
  WeeklyProgressDay,
  WeeklyProgressMetricValue,
} from "@/features/history/types";

type WeeklyFoodLog = {
  local_log_date: string;
  consumed_grams: number;
  calories_per_100g_snapshot: number;
  protein_per_100g_snapshot: number;
  carbohydrates_per_100g_snapshot: number;
  fat_per_100g_snapshot: number;
};

type WeeklyGoal = {
  effective_date: string;
  calories_target: number;
  protein_target: number;
  carbohydrates_target: number;
  fat_target: number;
  calories_min: number;
  calories_max: number;
  protein_min: number;
  protein_max: number;
  carbohydrates_min: number;
  carbohydrates_max: number;
  fat_min: number;
  fat_max: number;
};

const dayLabels: Array<Pick<WeeklyProgressDay, "shortLabel" | "label">> = [
  { shortLabel: "M", label: "Mon" },
  { shortLabel: "T", label: "Tue" },
  { shortLabel: "W", label: "Wed" },
  { shortLabel: "T", label: "Thu" },
  { shortLabel: "F", label: "Fri" },
  { shortLabel: "S", label: "Sat" },
  { shortLabel: "S", label: "Sun" },
];

export function resolveHistoryWeekStart(value: string | null | undefined, today: string) {
  return startOfISOWeek(isISODate(value) ? value : today);
}

export function buildWeeklyProgressData({
  goals,
  logs,
  today,
  weekStart,
}: {
  goals: WeeklyGoal[];
  logs: WeeklyFoodLog[];
  today: string;
  weekStart: string;
}): WeeklyProgressData {
  const normalizedWeekStart = startOfISOWeek(weekStart);
  const weekDays = getISOWeekDays(normalizedWeekStart);
  const totalsByDate = new Map<string, NutritionValues>();
  const sortedGoals = [...goals].sort((first, second) =>
    first.effective_date.localeCompare(second.effective_date),
  );

  logs.forEach((log) => {
    const consumed = calculateConsumedNutrition(
      {
        calories: log.calories_per_100g_snapshot,
        protein: log.protein_per_100g_snapshot,
        carbohydrates: log.carbohydrates_per_100g_snapshot,
        fat: log.fat_per_100g_snapshot,
      },
      log.consumed_grams,
    );
    const previousTotal = totalsByDate.get(log.local_log_date) ?? zeroNutritionValues();

    totalsByDate.set(log.local_log_date, aggregateNutrition([previousTotal, consumed]));
  });

  return {
    weekStart: normalizedWeekStart,
    weekEnd: weekDays[6],
    previousWeekStart: addISODays(normalizedWeekStart, -7),
    nextWeekStart: addISODays(normalizedWeekStart, 7),
    days: weekDays.map((date, index) => {
      const totals = totalsByDate.get(date) ?? zeroNutritionValues();
      const targets = getTargetsForDate(sortedGoals, date);

      return {
        ...dayLabels[index],
        date,
        isToday: date === today,
        values: {
          calories: buildMetricValue(
            totals.calories,
            targets.caloriesMinTarget,
            targets.caloriesTarget,
          ),
          protein: buildMetricValue(
            totals.protein,
            targets.proteinMinTarget,
            targets.proteinTarget,
          ),
          carbohydrates: buildMetricValue(
            totals.carbohydrates,
            targets.carbohydratesMinTarget,
            targets.carbohydratesTarget,
          ),
          fat: buildMetricValue(
            totals.fat,
            targets.fatMinTarget,
            targets.fatTarget,
          ),
        },
      };
    }),
  };
}

function getTargetsForDate(goals: WeeklyGoal[], date: string): NutritionTargets {
  let targets = defaultDailyGoals;

  goals.forEach((goal) => {
    if (goal.effective_date > date) {
      return;
    }

    targets = {
      caloriesMinTarget: goal.calories_min,
      caloriesTarget: goal.calories_max,
      proteinMinTarget: goal.protein_min,
      proteinTarget: goal.protein_max,
      carbohydratesMinTarget: goal.carbohydrates_min,
      carbohydratesTarget: goal.carbohydrates_max,
      fatMinTarget: goal.fat_min,
      fatTarget: goal.fat_max,
    };
  });

  return targets;
}

function buildMetricValue(
  consumed: number,
  minTarget: number,
  maxTarget: number,
): WeeklyProgressMetricValue {
  const safeMinTarget = Math.max(minTarget, 0);
  const safeMaxTarget = Math.max(maxTarget, safeMinTarget, 0);
  const rangeStatus =
    consumed < safeMinTarget ? "below" : consumed > safeMaxTarget ? "above" : "inside";

  return {
    consumed,
    minTarget: safeMinTarget,
    target: safeMaxTarget,
    maxTarget: safeMaxTarget,
    completionRatio: safeMaxTarget > 0 ? consumed / safeMaxTarget : 0,
    rangeStatus,
  };
}

function zeroNutritionValues(): NutritionValues {
  return {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
  };
}
