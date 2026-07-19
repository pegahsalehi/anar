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
} from "@/features/settings/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocalISODate } from "@/lib/dates";

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
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "You must be signed in to update daily goals.",
      fieldErrors: {},
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();
  const effectiveDate = getLocalISODate(new Date(), profile?.timezone ?? "UTC");

  const { error } = await supabase.from("daily_goals").upsert(
    {
      user_id: user.id,
      effective_date: effectiveDate,
      calories_target: parsed.data.caloriesMax,
      protein_target: parsed.data.proteinMax,
      carbohydrates_target: parsed.data.carbohydratesMax,
      fat_target: parsed.data.fatMax,
      calories_min: parsed.data.caloriesMin,
      calories_max: parsed.data.caloriesMax,
      protein_min: parsed.data.proteinMin,
      protein_max: parsed.data.proteinMax,
      carbohydrates_min: parsed.data.carbohydratesMin,
      carbohydrates_max: parsed.data.carbohydratesMax,
      fat_min: parsed.data.fatMin,
      fat_max: parsed.data.fatMax,
    },
    {
      onConflict: "user_id,effective_date",
    },
  );

  if (error) {
    return {
      status: "error",
      message: "Daily goals could not be saved. Please try again.",
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
