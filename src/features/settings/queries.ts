import { getLocalISODate } from "@/lib/dates";
import { defaultDailyGoals } from "@/lib/nutrition";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AppPreferenceValues,
  DailyNutritionTargetValues,
  SettingsPageData,
} from "@/features/settings/types";
import type { Database } from "@/types/database";
import { isRealSupabaseRequestError } from "@/lib/supabase/errors";

const settingsDataLoadError = "Settings data could not be loaded. Please try again.";

type ProfileTimezoneRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "timezone" | "week_starts_on" | "time_format"
>;

type GoalRow = Pick<
  Database["public"]["Tables"]["daily_goals"]["Row"],
  | "calories_target"
  | "protein_target"
  | "carbohydrates_target"
  | "fat_target"
>;

export async function getSettingsPageData(): Promise<SettingsPageData> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return {
      dailyGoals: getDefaultDailyNutritionTargets(),
      effectiveDate: "",
      preferences: getDefaultAppPreferences(),
      error: settingsDataLoadError,
    };
  }

  if (!user) {
    return {
      dailyGoals: getDefaultDailyNutritionTargets(),
      effectiveDate: "",
      preferences: getDefaultAppPreferences(),
      error: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("timezone, week_starts_on, time_format")
    .eq("id", user.id)
    .maybeSingle();

  const profileRow = profile as ProfileTimezoneRow | null;
  const localDate = getLocalISODate(new Date(), profileRow?.timezone ?? "UTC");
  const { data: goal, error: goalError } = await supabase
    .from("daily_goals")
    .select("calories_target, protein_target, carbohydrates_target, fat_target")
    .eq("user_id", user.id)
    .lte("effective_date", localDate)
    .order("effective_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    dailyGoals: goal
      ? getDailyNutritionTargets(goal as GoalRow)
      : getDefaultDailyNutritionTargets(),
    effectiveDate: localDate,
    preferences: getAppPreferences(profileRow),
    error: [profileError, goalError].some(isRealSupabaseRequestError)
      ? settingsDataLoadError
      : null,
  };
}

function getDailyNutritionTargets(goal: GoalRow): DailyNutritionTargetValues {
  return {
    caloriesTarget: goal.calories_target,
    proteinTarget: goal.protein_target,
    carbohydratesTarget: goal.carbohydrates_target,
    fatTarget: goal.fat_target,
  };
}

function getDefaultDailyNutritionTargets(): DailyNutritionTargetValues {
  return {
    caloriesTarget: defaultDailyGoals.caloriesTarget,
    proteinTarget: defaultDailyGoals.proteinTarget,
    carbohydratesTarget: defaultDailyGoals.carbohydratesTarget,
    fatTarget: defaultDailyGoals.fatTarget,
  };
}

function getAppPreferences(profile: ProfileTimezoneRow | null): AppPreferenceValues {
  return {
    weekStartsOn: profile?.week_starts_on ?? "monday",
    timeFormat: profile?.time_format ?? "12h",
  };
}

function getDefaultAppPreferences(): AppPreferenceValues {
  return {
    weekStartsOn: "monday",
    timeFormat: "12h",
  };
}
