"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  appPreferencesSchema,
  changePasswordSchema,
  dailyNutritionTargetsSchema,
} from "@/features/settings/schemas";
import type {
  AppPreferenceActionState,
  AppPreferenceField,
  ChangePasswordActionState,
  ChangePasswordField,
  DailyNutritionTargetActionState,
  DailyNutritionTargetField,
  DailyNutritionTargetValues,
} from "@/features/settings/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocalISODate } from "@/lib/dates";
import type { Database } from "@/types/database";

type DailyGoalInsert = Database["public"]["Tables"]["daily_goals"]["Insert"];
type DailyGoalUpdate = Database["public"]["Tables"]["daily_goals"]["Update"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type SupabaseErrorLike = {
  code?: string;
  details?: string | null;
  hint?: string | null;
  message?: string;
};

export async function saveDailyNutritionTargetsAction(
  _previousState: DailyNutritionTargetActionState,
  formData: FormData,
): Promise<DailyNutritionTargetActionState> {
  const parsed = dailyNutritionTargetsSchema.safeParse(readFormData(formData));

  if (!parsed.success) {
    return dailyNutritionTargetValidationError(parsed.error);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    logSupabaseError("auth.getUser failed while saving daily nutrition targets", authError);
    return {
      status: "error",
      message: "Your session could not be verified. Please log in again.",
      fieldErrors: {},
    };
  }

  if (!user) {
    console.warn("[settings:saveDailyNutritionTargets] No authenticated user session was available.");
    return {
      status: "error",
      message: "You must be signed in to update daily nutrition targets.",
      fieldErrors: {},
    };
  }

  console.info("[settings:saveDailyNutritionTargets] Authenticated user session confirmed.", {
    userId: user.id,
  });

  const profileResult = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();

  if (profileResult.error) {
    logSupabaseError("profiles.select failed while saving daily nutrition targets", profileResult.error, {
      userId: user.id,
    });
    return {
      status: "error",
      message: getDailyGoalSaveErrorMessage(profileResult.error),
      fieldErrors: {},
    };
  }

  const effectiveDate = getLocalISODate(new Date(), profileResult.data?.timezone ?? "UTC");
  const goalValues = buildDailyGoalValues(parsed.data);
  const goalLookupResult = await supabase
    .from("daily_goals")
    .select("id")
    .eq("user_id", user.id)
    .eq("effective_date", effectiveDate)
    .limit(1)
    .maybeSingle();

  if (goalLookupResult.error) {
    logSupabaseError("daily_goals.select failed before saving daily nutrition targets", goalLookupResult.error, {
      effectiveDate,
      userId: user.id,
    });
    return {
      status: "error",
      message: getDailyGoalSaveErrorMessage(goalLookupResult.error),
      fieldErrors: {},
    };
  }

  const saveResult = goalLookupResult.data?.id
    ? await supabase
        .from("daily_goals")
        .update(goalValues satisfies DailyGoalUpdate)
        .eq("id", goalLookupResult.data.id)
        .eq("user_id", user.id)
    : await supabase.from("daily_goals").insert({
        ...goalValues,
        user_id: user.id,
        effective_date: effectiveDate,
      } satisfies DailyGoalInsert);

  if (saveResult.error) {
    logSupabaseError("daily_goals.save failed", saveResult.error, {
      effectiveDate,
      operation: goalLookupResult.data?.id ? "update" : "insert",
      userId: user.id,
    });
    return {
      status: "error",
      message: getDailyGoalSaveErrorMessage(saveResult.error),
      fieldErrors: {},
    };
  }

  revalidatePath("/settings");
  revalidatePath("/today");
  revalidatePath("/history");

  return {
    status: "success",
    message: "Daily nutrition targets saved.",
    fieldErrors: {},
  };
}

function buildDailyGoalValues(values: DailyNutritionTargetValues) {
  return {
    calories_target: values.caloriesTarget,
    protein_target: values.proteinTarget,
    carbohydrates_target: values.carbohydratesTarget,
    fat_target: values.fatTarget,
  };
}

export async function changePasswordAction(
  _previousState: ChangePasswordActionState,
  formData: FormData,
): Promise<ChangePasswordActionState> {
  const parsed = changePasswordSchema.safeParse(readFormData(formData));

  if (!parsed.success) {
    return changePasswordValidationError(parsed.error);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      status: "error",
      message: "You must be signed in to change your password.",
      fieldErrors: {},
    };
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });

  if (reauthError) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: {
        currentPassword: "Current password is incorrect.",
      },
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });

  if (error) {
    return {
      status: "error",
      message: translatePasswordError(error.message),
      fieldErrors: {},
    };
  }

  return {
    status: "success",
    message: "Password updated.",
    fieldErrors: {},
  };
}

export async function saveAppPreferencesAction(
  _previousState: AppPreferenceActionState,
  formData: FormData,
): Promise<AppPreferenceActionState> {
  const parsed = appPreferencesSchema.safeParse(readFormData(formData));

  if (!parsed.success) {
    return appPreferenceValidationError(parsed.error);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "You must be signed in to update app preferences.",
      fieldErrors: {},
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      week_starts_on: parsed.data.weekStartsOn,
      time_format: parsed.data.timeFormat,
    } satisfies ProfileUpdate)
    .eq("id", user.id);

  if (error) {
    console.error("[settings:saveAppPreferences] profiles.update failed", {
      message: error.message ?? null,
      userId: user.id,
    });

    return {
      status: "error",
      message: "App preferences could not be saved. Please try again.",
      fieldErrors: {},
    };
  }

  revalidatePath("/settings");
  revalidatePath("/today");
  revalidatePath("/history");

  return {
    status: "success",
    message: "App preferences saved.",
    fieldErrors: {},
  };
}

function readFormData(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function logSupabaseError(
  context: string,
  error: SupabaseErrorLike,
  metadata: Record<string, string> = {},
) {
  console.error(`[settings:saveDailyNutritionTargets] ${context}`, {
    code: error.code ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
    message: error.message ?? null,
    ...metadata,
  });
}

function getDailyGoalSaveErrorMessage(error: SupabaseErrorLike) {
  const code = error.code ?? "";
  const message = error.message?.toLowerCase() ?? "";

  if (code === "42703" || message.includes("does not exist")) {
    return "Daily nutrition target columns are missing in Supabase. Apply the latest migration, then try again.";
  }

  if (code === "42501" || message.includes("permission denied")) {
    return "You do not have permission to save daily nutrition targets for this account.";
  }

  if (code === "23514" || message.includes("check constraint")) {
    return "Please enter non-negative daily nutrition targets.";
  }

  if (code === "23505" || message.includes("duplicate key")) {
    return "A daily nutrition target already exists for this date. Refresh the page and try again.";
  }

  return "Daily nutrition targets could not be saved because Supabase rejected the request. Check the server logs for details.";
}

function dailyNutritionTargetValidationError(
  error: z.ZodError,
): DailyNutritionTargetActionState {
  const fieldErrors: DailyNutritionTargetActionState["fieldErrors"] = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (isDailyNutritionTargetField(field) && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  });

  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    fieldErrors,
  };
}

function changePasswordValidationError(error: z.ZodError): ChangePasswordActionState {
  const fieldErrors: ChangePasswordActionState["fieldErrors"] = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (isChangePasswordField(field) && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  });

  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    fieldErrors,
  };
}

function appPreferenceValidationError(error: z.ZodError): AppPreferenceActionState {
  const fieldErrors: AppPreferenceActionState["fieldErrors"] = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (isAppPreferenceField(field) && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  });

  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    fieldErrors,
  };
}

function isDailyNutritionTargetField(value: unknown): value is DailyNutritionTargetField {
  return (
    value === "caloriesTarget" ||
    value === "proteinTarget" ||
    value === "carbohydratesTarget" ||
    value === "fatTarget"
  );
}

function isChangePasswordField(value: unknown): value is ChangePasswordField {
  return (
    value === "currentPassword" ||
    value === "newPassword" ||
    value === "confirmNewPassword"
  );
}

function isAppPreferenceField(value: unknown): value is AppPreferenceField {
  return value === "weekStartsOn" || value === "timeFormat";
}

function translatePasswordError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("password")) {
    return "The new password is not valid.";
  }

  return "Password could not be updated. Please try again.";
}
