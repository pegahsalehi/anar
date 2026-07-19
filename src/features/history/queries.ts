import type { FoodLogListItem } from "@/components/nutrition/food-log-item";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSignedImageUrlMap } from "@/lib/storage/food-images";
import { formatTime } from "@/lib/format";
import { addISODays, getLocalISODate } from "@/lib/dates";
import {
  aggregateNutrition,
  calculateConsumedNutrition,
  defaultDailyGoals,
  progressFromTotals,
  type DailyNutritionProgress,
} from "@/lib/nutrition";
import type { WeeklyProgressData } from "@/features/history/types";
import {
  buildWeeklyProgressData,
  resolveHistoryWeekStart,
} from "@/features/history/weekly-progress";
import { calculateLogDayStats, type LogDayStats } from "@/features/today/streaks";
import type { Database } from "@/types/database";

type FoodLogRow = Database["public"]["Tables"]["food_logs"]["Row"];
type LogDayRow = Pick<FoodLogRow, "local_log_date">;
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
type WeeklyGoalRow = Pick<
  Database["public"]["Tables"]["daily_goals"]["Row"],
  | "effective_date"
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
type WeeklyFoodLogRow = Pick<
  FoodLogRow,
  | "local_log_date"
  | "consumed_grams"
  | "calories_per_100g_snapshot"
  | "protein_per_100g_snapshot"
  | "carbohydrates_per_100g_snapshot"
  | "fat_per_100g_snapshot"
>;

type HistoryDateData = {
  activeDates: string[];
  streak: LogDayStats;
  logs: FoodLogListItem[];
  progress: DailyNutritionProgress;
  error: string | null;
};

type HistoryActiveDatesData = {
  activeDates: string[];
  weeklyProgress: WeeklyProgressData;
  streak: LogDayStats;
  error: string | null;
};

export async function getHistoryActiveDates(
  weekStart?: string,
): Promise<HistoryActiveDatesData> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const empty = buildEmptyHistoryActiveDatesData(weekStart);

  if (!user) {
    return {
      ...empty,
      error: "You must be signed in.",
    };
  }

  const profileResult = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileResult.data as ProfileTimezoneRow | null;
  const timezone = profile?.timezone ?? "UTC";
  const today = getLocalISODate(new Date(), timezone);
  const resolvedWeekStart = resolveHistoryWeekStart(weekStart, today);
  const weekEnd = addISODays(resolvedWeekStart, 6);

  const [activeDatesResult, weeklyLogsResult, weeklyGoalsResult] = await Promise.all([
    supabase
      .from("food_logs")
      .select("local_log_date")
      .eq("user_id", user.id)
      .order("local_log_date", { ascending: false })
      .limit(500),
    supabase
      .from("food_logs")
      .select(
        "local_log_date, consumed_grams, calories_per_100g_snapshot, protein_per_100g_snapshot, carbohydrates_per_100g_snapshot, fat_per_100g_snapshot",
      )
      .eq("user_id", user.id)
      .gte("local_log_date", resolvedWeekStart)
      .lte("local_log_date", weekEnd),
    supabase
      .from("daily_goals")
      .select(
        "effective_date, calories_target, protein_target, carbohydrates_target, fat_target, calories_min, calories_max, protein_min, protein_max, carbohydrates_min, carbohydrates_max, fat_min, fat_max",
      )
      .eq("user_id", user.id)
      .lte("effective_date", weekEnd)
      .order("effective_date", { ascending: true }),
  ]);

  const activeDates = getUniqueActiveDates(activeDatesResult.data);

  return {
    activeDates,
    weeklyProgress: buildWeeklyProgressData({
      goals: (weeklyGoalsResult.data ?? []) as WeeklyGoalRow[],
      logs: (weeklyLogsResult.data ?? []) as WeeklyFoodLogRow[],
      today,
      weekStart: resolvedWeekStart,
    }),
    streak: calculateLogDayStats(
      activeDates,
      today,
    ),
    error:
      profileResult.error ||
      activeDatesResult.error ||
      weeklyLogsResult.error ||
      weeklyGoalsResult.error
        ? "History dates could not be loaded."
        : null,
  };
}

export async function getHistoryDateData(date: string): Promise<HistoryDateData> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const empty = buildEmptyHistoryDateData();

  if (!user) {
    return {
      ...empty,
      error: "You must be signed in.",
    };
  }

  const [profileResult, activeDatesResult, goalResult, logsResult] = await Promise.all([
    supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle(),
    supabase
      .from("food_logs")
      .select("local_log_date")
      .eq("user_id", user.id)
      .order("local_log_date", { ascending: false })
      .limit(500),
    supabase
      .from("daily_goals")
      .select(
        "calories_target, protein_target, carbohydrates_target, fat_target, calories_min, calories_max, protein_min, protein_max, carbohydrates_min, carbohydrates_max, fat_min, fat_max",
      )
      .eq("user_id", user.id)
      .lte("effective_date", date)
      .order("effective_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("local_log_date", date)
      .order("logged_at", { ascending: false }),
  ]);

  const profile = profileResult.data as ProfileTimezoneRow | null;
  const goal = goalResult.data as GoalRow | null;
  const timezone = profile?.timezone ?? "UTC";
  const activeDates = getUniqueActiveDates(activeDatesResult.data);
  const imageUrls = await createSignedImageUrlMap(
    supabase,
    ((logsResult.data ?? []) as FoodLogRow[]).map((log) => log.image_path_snapshot),
  );
  const logRows = (logsResult.data ?? []) as FoodLogRow[];
  const logs: FoodLogListItem[] =
    logRows.map((log) => {
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
        name: log.food_name_snapshot,
        grams: log.consumed_grams,
        calories: consumed.calories,
        protein: consumed.protein,
        carbohydrates: consumed.carbohydrates,
        fat: consumed.fat,
        time: formatTime(new Date(log.logged_at), timezone),
        imageUrl: log.image_path_snapshot
          ? imageUrls.get(log.image_path_snapshot) ?? null
          : null,
      };
    });
  const totals = aggregateNutrition(
    logs.map((log) => ({
      calories: log.calories,
      protein: log.protein,
      carbohydrates: log.carbohydrates,
      fat: log.fat,
    })),
  );
  const goals = goal
    ? {
        caloriesMinTarget: goal.calories_min,
        caloriesTarget: goal.calories_max,
        proteinMinTarget: goal.protein_min,
        proteinTarget: goal.protein_max,
        carbohydratesMinTarget: goal.carbohydrates_min,
        carbohydratesTarget: goal.carbohydrates_max,
        fatMinTarget: goal.fat_min,
        fatTarget: goal.fat_max,
      }
    : defaultDailyGoals;

  return {
    activeDates,
    streak: calculateLogDayStats(activeDates, getLocalISODate(new Date(), timezone)),
    logs,
    progress: progressFromTotals(totals, goals),
    error:
      profileResult.error || activeDatesResult.error || goalResult.error || logsResult.error
        ? "History data could not be loaded."
        : null,
  };
}

function buildEmptyHistoryActiveDatesData(weekStart?: string): HistoryActiveDatesData {
  const today = getLocalISODate(new Date(), "UTC");
  const resolvedWeekStart = resolveHistoryWeekStart(weekStart, today);

  return {
    activeDates: [],
    weeklyProgress: buildWeeklyProgressData({
      goals: [],
      logs: [],
      today,
      weekStart: resolvedWeekStart,
    }),
    streak: calculateLogDayStats([], today),
    error: null,
  };
}

function buildEmptyHistoryDateData(): HistoryDateData {
  const today = getLocalISODate(new Date(), "UTC");

  return {
    activeDates: [],
    streak: calculateLogDayStats([], today),
    logs: [],
    progress: progressFromTotals(
      { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
      defaultDailyGoals,
    ),
    error: null,
  };
}

function getUniqueActiveDates(rows: unknown) {
  return Array.from(
    new Set(((rows ?? []) as LogDayRow[]).map((log) => log.local_log_date)),
  );
}
