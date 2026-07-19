import { getLocalISODate } from "@/lib/dates";
import { defaultDailyGoals } from "@/lib/nutrition";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  DailyGoalRangeValues,
  SettingsPageData,
} from "@/features/settings/types";
import type { Database } from "@/types/database";

type ProfileTimezoneRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "timezone"
>;

type GoalRow = Pick<
  Database["public"]["Tables"]["daily_goals"]["Row"],
  | "calories_min"
  | "calories_max"
  | "protein_min"
  | "protein_max"
  | "carbohydrates_min"
  | "carbohydrates_max"
  | "fat_min"
  | "fat_max"
>;

export async function getSettingsPageData(): Promise<SettingsPageData> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      dailyGoals: getDefaultDailyGoalRanges(),
      effectiveDate: "",
      error: "You must be signed in.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();

  const profileRow = profile as ProfileTimezoneRow | null;
  const localDate = getLocalISODate(new Date(), profileRow?.timezone ?? "UTC");
  const { data: goal, error: goalError } = await supabase
    .from("daily_goals")
    .select(
      "calories_min, calories_max, protein_min, protein_max, carbohydrates_min, carbohydrates_max, fat_min, fat_max",
    )
    .eq("user_id", user.id)
    .lte("effective_date", localDate)
    .order("effective_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    dailyGoals: goal ? getDailyGoalRanges(goal as GoalRow) : getDefaultDailyGoalRanges(),
    effectiveDate: localDate,
    error: profileError || goalError ? "Settings could not be fully loaded." : null,
  };
}

function getDailyGoalRanges(goal: GoalRow): DailyGoalRangeValues {
  return {
    caloriesMin: goal.calories_min,
    caloriesMax: goal.calories_max,
    proteinMin: goal.protein_min,
    proteinMax: goal.protein_max,
    carbohydratesMin: goal.carbohydrates_min,
    carbohydratesMax: goal.carbohydrates_max,
    fatMin: goal.fat_min,
    fatMax: goal.fat_max,
  };
}

function getDefaultDailyGoalRanges(): DailyGoalRangeValues {
  return {
    caloriesMin: defaultDailyGoals.caloriesMinTarget,
    caloriesMax: defaultDailyGoals.caloriesTarget,
    proteinMin: defaultDailyGoals.proteinMinTarget,
    proteinMax: defaultDailyGoals.proteinTarget,
    carbohydratesMin: defaultDailyGoals.carbohydratesMinTarget,
    carbohydratesMax: defaultDailyGoals.carbohydratesTarget,
    fatMin: defaultDailyGoals.fatMinTarget,
    fatMax: defaultDailyGoals.fatTarget,
  };
}
