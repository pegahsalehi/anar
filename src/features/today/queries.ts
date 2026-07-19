import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSignedImageUrlMap } from "@/lib/storage/food-images";
import { getLocalISODate, parseISODate } from "@/lib/dates";
import { formatDate, formatTime } from "@/lib/format";
import {
  aggregateNutrition,
  calculateConsumedNutrition,
  defaultDailyGoals,
  progressFromTotals,
  type NutritionTargets,
} from "@/lib/nutrition";
import { calculateLogDayStats } from "@/features/today/streaks";
import type {
  FoodLogRow,
  TodayDashboardData,
  TodayFoodLogItem,
  TodayFoodOption,
} from "@/features/today/types";
import type { Database } from "@/types/database";

type TodayFoodRow = Pick<
  Database["public"]["Tables"]["foods"]["Row"],
  | "id"
  | "name"
  | "image_path"
  | "calories_per_100g"
  | "protein_per_100g"
  | "carbohydrates_per_100g"
  | "fat_per_100g"
  | "is_favorite"
  | "created_at"
>;

type LogDayRow = Pick<
  Database["public"]["Tables"]["food_logs"]["Row"],
  "local_log_date"
>;
type ProfileTimezoneRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "timezone"
>;
type GoalRow = Pick<
  Database["public"]["Tables"]["daily_goals"]["Row"],
  | "calories_target"
  | "protein_target"
  | "carbohydrates_target"
  | "fat_target"
  | "calories_min"
  | "calories_max"
  | "protein_min"
  | "protein_max"
  | "carbohydrates_min"
  | "carbohydrates_max"
  | "fat_min"
  | "fat_max"
>;

export async function getTodayDashboardData(): Promise<TodayDashboardData> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const empty = buildEmptyDashboardData();

  if (!user) {
    return {
      ...empty,
      error: "You must be signed in.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();

  const profileRow = profile as ProfileTimezoneRow | null;
  const timezone = profileRow?.timezone ?? "UTC";
  const localDate = getLocalISODate(new Date(), timezone);

  const [goalResult, foodsResult, logsResult, logDaysResult] = await Promise.all([
    supabase
      .from("daily_goals")
      .select(
        "calories_target, protein_target, carbohydrates_target, fat_target, calories_min, calories_max, protein_min, protein_max, carbohydrates_min, carbohydrates_max, fat_min, fat_max",
      )
      .eq("user_id", user.id)
      .lte("effective_date", localDate)
      .order("effective_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("foods")
      .select(
        "id, name, image_path, calories_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g, is_favorite, created_at",
      )
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("is_favorite", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("local_log_date", localDate)
      .order("logged_at", { ascending: false }),
    supabase
      .from("food_logs")
      .select("local_log_date")
      .eq("user_id", user.id)
      .order("local_log_date", { ascending: false })
      .limit(500),
  ]);

  const goal = goalResult.data as GoalRow | null;
  const goals = goal ? getNutritionTargetsFromGoal(goal) : defaultDailyGoals;

  const foods = (foodsResult.data ?? []) as TodayFoodRow[];
  const logs = (logsResult.data ?? []) as FoodLogRow[];
  const imageUrls = await createSignedImageUrlMap(supabase, [
    ...foods.map((food) => food.image_path),
    ...logs.map((log) => log.image_path_snapshot),
  ]);

  const foodOptions: TodayFoodOption[] = foods.map((food) => ({
    id: food.id,
    name: food.name,
    imageUrl: food.image_path ? imageUrls.get(food.image_path) ?? null : null,
    is_favorite: food.is_favorite,
    calories_per_100g: food.calories_per_100g,
    protein_per_100g: food.protein_per_100g,
    carbohydrates_per_100g: food.carbohydrates_per_100g,
    fat_per_100g: food.fat_per_100g,
  }));

  const mappedLogs: TodayFoodLogItem[] = logs.map((log) => {
    const consumed = calculateConsumedNutrition(
      {
        calories: log.calories_per_100g_snapshot,
        protein: log.protein_per_100g_snapshot,
        carbohydrates: log.carbohydrates_per_100g_snapshot,
        fat: log.fat_per_100g_snapshot,
      },
      log.consumed_grams,
    );

    return {
      id: log.id,
      foodId: log.food_id,
      name: log.food_name_snapshot,
      grams: log.consumed_grams,
      calories: consumed.calories,
      protein: consumed.protein,
      carbohydrates: consumed.carbohydrates,
      fat: consumed.fat,
      loggedAt: log.logged_at,
      time: formatTime(new Date(log.logged_at), timezone),
      imageUrl: log.image_path_snapshot
        ? imageUrls.get(log.image_path_snapshot) ?? null
        : null,
    };
  });

  const totals = aggregateNutrition(
    mappedLogs.map((log) => ({
      calories: log.calories,
      protein: log.protein,
      carbohydrates: log.carbohydrates,
      fat: log.fat,
    })),
  );

  return {
    localDate,
    displayDate: formatDate(parseISODate(localDate)),
    timezone,
    goals,
    totals,
    progress: progressFromTotals(totals, goals),
    foods: foodOptions,
    quickFoods: getQuickFoods(foodOptions, mappedLogs),
    logs: mappedLogs,
    streak: calculateLogDayStats(
      ((logDaysResult.data ?? []) as LogDayRow[]).map((logDay) => logDay.local_log_date),
      localDate,
    ),
    error:
      goalResult.error || foodsResult.error || logsResult.error || logDaysResult.error
        ? "Some nutrition data could not be loaded."
        : null,
  };
}

function getNutritionTargetsFromGoal(goal: GoalRow): NutritionTargets {
  return {
    caloriesMinTarget: goal.calories_min,
    caloriesTarget: goal.calories_max,
    proteinMinTarget: goal.protein_min,
    proteinTarget: goal.protein_max,
    carbohydratesMinTarget: goal.carbohydrates_min,
    carbohydratesTarget: goal.carbohydrates_max,
    fatMinTarget: goal.fat_min,
    fatTarget: goal.fat_max,
  };
}

function buildEmptyDashboardData(): TodayDashboardData {
  const goals: NutritionTargets = defaultDailyGoals;
  const totals = { calories: 0, protein: 0, carbohydrates: 0, fat: 0 };

  return {
    localDate: "",
    displayDate: "",
    timezone: "UTC",
    goals,
    totals,
    progress: progressFromTotals(totals, goals),
    foods: [],
    quickFoods: [],
    logs: [],
    streak: {
      ...calculateLogDayStats([], getLocalISODate(new Date(), "UTC")),
    },
    error: null,
  };
}

function getQuickFoods(foods: TodayFoodOption[], logs: TodayFoodLogItem[]) {
  const quickFoods = new Map<string, TodayFoodOption>();

  foods
    .filter((food) => food.is_favorite)
    .forEach((food) => quickFoods.set(food.id, food));

  logs.forEach((log) => {
    if (!log.foodId || quickFoods.has(log.foodId)) {
      return;
    }

    const food = foods.find((item) => item.id === log.foodId);
    if (food) {
      quickFoods.set(food.id, food);
    }
  });

  foods.forEach((food) => {
    if (quickFoods.size >= 8 || quickFoods.has(food.id)) {
      return;
    }

    quickFoods.set(food.id, food);
  });

  return Array.from(quickFoods.values()).slice(0, 8);
}
