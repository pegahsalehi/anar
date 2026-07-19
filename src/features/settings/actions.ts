"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  changePasswordSchema,
  dailyGoalRangesSchema,
} from "@/features/settings/schemas";
import type {
  ChangePasswordActionState,
  ChangePasswordField,
  DailyGoalRangeActionState,
  DailyGoalRangeField,
  DailyGoalRangeValues,
} from "@/features/settings/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocalISODate } from "@/lib/dates";
import type { Database } from "@/types/database";

type DailyGoalInsert = Database["public"]["Tables"]["daily_goals"]["Insert"];
type DailyGoalUpdate = Database["public"]["Tables"]["daily_goals"]["Update"];
type SupabaseErrorLike = {
  code?: string;
  details?: string | null;
  hint?: string | null;
  message?: string;
};

export async function saveDailyGoalRangesAction(
  _previousState: DailyGoalRangeActionState,
  formData: FormData,
): Promise<DailyGoalRangeActionState> {
  const parsed = dailyGoalRangesSchema.safeParse(readFormData(formData));

  if (!parsed.success) {
    return dailyGoalRangeValidationError(parsed.error);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    logSupabaseError("auth.getUser failed while saving daily goals", authError);
    return {
      status: "error",
      message: "Your session could not be verified. Please log in again.",
      fieldErrors: {},
    };
  }

  if (!user) {
    console.warn("[settings:saveDailyGoalRanges] No authenticated user session was available.");
    return {
      status: "error",
      message: "You must be signed in to update daily goals.",
      fieldErrors: {},
    };
  }

  console.info("[settings:saveDailyGoalRanges] Authenticated user session confirmed.", {
    userId: user.id,
  });

  const profileResult = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();

  if (profileResult.error) {
    logSupabaseError("profiles.select failed while saving daily goals", profileResult.error, {
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
    logSupabaseError("daily_goals.select failed before saving daily goals", goalLookupResult.error, {
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
    message: "Daily goal ranges saved.",
    fieldErrors: {},
  };
}

function buildDailyGoalValues(values: DailyGoalRangeValues) {
  return {
    calories_target: values.caloriesMax,
    protein_target: values.proteinMax,
    carbohydrates_target: values.carbohydratesMax,
    fat_target: values.fatMax,
    calories_min: values.caloriesMin,
    calories_max: values.caloriesMax,
    protein_min: values.proteinMin,
    protein_max: values.proteinMax,
    carbohydrates_min: values.carbohydratesMin,
    carbohydrates_max: values.carbohydratesMax,
    fat_min: values.fatMin,
    fat_max: values.fatMax,
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

function readFormData(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function logSupabaseError(
  context: string,
  error: SupabaseErrorLike,
  metadata: Record<string, string> = {},
) {
  console.error(`[settings:saveDailyGoalRanges] ${context}`, {
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
    return "Daily goal range columns are missing in Supabase. Apply the latest migration, then try again.";
  }

  if (code === "42501" || message.includes("permission denied")) {
    return "You do not have permission to save daily goals for this account.";
  }

  if (code === "23514" || message.includes("check constraint")) {
    return "Please enter non-negative goal ranges where each minimum is not greater than its maximum.";
  }

  if (code === "23505" || message.includes("duplicate key")) {
    return "A goal range already exists for this date. Refresh the page and try again.";
  }

  return "Daily goal ranges could not be saved because Supabase rejected the request. Check the server logs for details.";
}

function dailyGoalRangeValidationError(error: z.ZodError): DailyGoalRangeActionState {
  const fieldErrors: DailyGoalRangeActionState["fieldErrors"] = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (isDailyGoalRangeField(field) && !fieldErrors[field]) {
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

function isDailyGoalRangeField(value: unknown): value is DailyGoalRangeField {
  return (
    value === "caloriesMin" ||
    value === "caloriesMax" ||
    value === "proteinMin" ||
    value === "proteinMax" ||
    value === "carbohydratesMin" ||
    value === "carbohydratesMax" ||
    value === "fatMin" ||
    value === "fatMax"
  );
}

function isChangePasswordField(value: unknown): value is ChangePasswordField {
  return (
    value === "currentPassword" ||
    value === "newPassword" ||
    value === "confirmNewPassword"
  );
}

function translatePasswordError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("password")) {
    return "The new password is not valid.";
  }

  return "Password could not be updated. Please try again.";
}
