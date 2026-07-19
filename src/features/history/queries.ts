import type { FoodLogListItem } from "@/components/nutrition/food-log-item";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSignedImageUrlMap } from "@/lib/storage/food-images";
import { formatTime } from "@/lib/format";
import {
  aggregateNutrition,
  calculateConsumedNutrition,
  defaultDailyGoals,
  progressFromTotals,
  type DailyNutritionProgress,
} from "@/lib/nutrition";
import type { Database } from "@/types/database";

type FoodLogRow = Database["public"]["Tables"]["food_logs"]["Row"];
type LogDayRow = Pick<FoodLogRow, "local_log_date">;
type ProfileTimezoneRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "timezone"
>;
type GoalRow = Pick<
  Database["public"]["Tables"]["daily_goals"]["Row"],
  "calories_target" | "protein_target" | "carbohydrates_target"
>;

type HistoryDateData = {
  activeDates: string[];
  logs: FoodLogListItem[];
  progress: DailyNutritionProgress;
  error: string | null;
};

export async function getHistoryActiveDates() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      activeDates: [] as string[],
      error: "You must be signed in.",
    };
  }

  const { data, error } = await supabase
    .from("food_logs")
    .select("local_log_date")
    .eq("user_id", user.id)
    .order("local_log_date", { ascending: false })
    .limit(500);

  return {
    activeDates: Array.from(
      new Set(((data ?? []) as LogDayRow[]).map((log) => log.local_log_date)),
    ),
    error: error ? "History dates could not be loaded." : null,
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
      .select("calories_target, protein_target, carbohydrates_target")
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
    })),
  );
  const goals = goal
    ? {
        caloriesTarget: goal.calories_target,
        proteinTarget: goal.protein_target,
        carbohydratesTarget: goal.carbohydrates_target,
      }
    : defaultDailyGoals;

  return {
    activeDates: Array.from(
      new Set(
        ((activeDatesResult.data ?? []) as LogDayRow[]).map(
          (log) => log.local_log_date,
        ),
      ),
    ),
    logs,
    progress: progressFromTotals(totals, goals),
    error:
      profileResult.error || activeDatesResult.error || goalResult.error || logsResult.error
        ? "History data could not be loaded."
        : null,
  };
}

function buildEmptyHistoryDateData(): HistoryDateData {
  return {
    activeDates: [],
    logs: [],
    progress: progressFromTotals(
      { calories: 0, protein: 0, carbohydrates: 0 },
      defaultDailyGoals,
    ),
    error: null,
  };
}
