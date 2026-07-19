import {
  addISODays,
  getWeekDays,
  isISODate,
  startOfWeek,
  type WeekStartsOn,
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
};

const mondayDayLabels: Array<Pick<WeeklyProgressDay, "shortLabel" | "label">> = [
  { shortLabel: "M", label: "Mon" },
  { shortLabel: "T", label: "Tue" },
  { shortLabel: "W", label: "Wed" },
  { shortLabel: "T", label: "Thu" },
  { shortLabel: "F", label: "Fri" },
  { shortLabel: "S", label: "Sat" },
  { shortLabel: "S", label: "Sun" },
];

const sundayDayLabels: Array<Pick<WeeklyProgressDay, "shortLabel" | "label">> = [
  { shortLabel: "S", label: "Sun" },
  { shortLabel: "M", label: "Mon" },
  { shortLabel: "T", label: "Tue" },
  { shortLabel: "W", label: "Wed" },
  { shortLabel: "T", label: "Thu" },
  { shortLabel: "F", label: "Fri" },
  { shortLabel: "S", label: "Sat" },
];

export function resolveHistoryWeekStart(
  value: string | null | undefined,
  today: string,
  weekStartsOn: WeekStartsOn = "monday",
) {
  return startOfWeek(isISODate(value) ? value : today, weekStartsOn);
}

export function buildWeeklyProgressData({
  goals,
  logs,
  today,
  weekStartsOn = "monday",
  weekStart,
}: {
  goals: WeeklyGoal[];
  logs: WeeklyFoodLog[];
  today: string;
  weekStartsOn?: WeekStartsOn;
  weekStart: string;
}): WeeklyProgressData {
  const normalizedWeekStart = startOfWeek(weekStart, weekStartsOn);
  const weekDays = getWeekDays(normalizedWeekStart);
  const dayLabels = weekStartsOn === "sunday" ? sundayDayLabels : mondayDayLabels;
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
    weekStartsOn,
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
            targets.caloriesTarget,
          ),
          protein: buildMetricValue(
            totals.protein,
            targets.proteinTarget,
          ),
          carbohydrates: buildMetricValue(
            totals.carbohydrates,
            targets.carbohydratesTarget,
          ),
          fat: buildMetricValue(
            totals.fat,
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
      caloriesTarget: goal.calories_target,
      proteinTarget: goal.protein_target,
      carbohydratesTarget: goal.carbohydrates_target,
      fatTarget: goal.fat_target,
    };
  });

  return targets;
}

function buildMetricValue(
  consumed: number,
  target: number,
): WeeklyProgressMetricValue {
  const safeTarget = Math.max(target, 0);
  const targetStatus =
    consumed < safeTarget ? "below" : consumed > safeTarget ? "above" : "reached";

  return {
    consumed,
    target: safeTarget,
    completionRatio: safeTarget > 0 ? consumed / safeTarget : 0,
    targetStatus,
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
