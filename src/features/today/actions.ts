"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { buildFoodLogInsertPayload } from "@/features/today/logging";
import { logFoodSchema, updateFoodLogSchema } from "@/features/today/schemas";
import type { LogFoodMutationState } from "@/features/today/types";
import { getLocalISODate } from "@/lib/dates";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function addFoodLogAction(
  _previousState: LogFoodMutationState,
  formData: FormData,
): Promise<LogFoodMutationState> {
  const parsed = logFoodSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return mutationError("You must be signed in to log food.");
  }

  const { data: food, error: foodError } = await supabase
    .from("foods")
    .select(
      "id, name, image_path, calories_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g",
    )
    .eq("id", parsed.data.foodId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (foodError || !food) {
    return mutationError("Food was not found in your library.");
  }

  const timezone = await getUserTimezone(user.id);
  const loggedAt = new Date().toISOString();
  const payload = buildFoodLogInsertPayload({
    userId: user.id,
    food,
    consumedGrams: parsed.data.grams,
    loggedAt,
    localLogDate: getLocalISODate(new Date(loggedAt), timezone),
  });

  const { error } = await supabase.from("food_logs").insert(payload);

  if (error) {
    return mutationError("Food could not be logged. Please try again.");
  }

  revalidatePath("/today");
  revalidatePath("/history");

  return {
    status: "success",
    message: "Food logged.",
    fieldErrors: {},
  };
}

export async function updateFoodLogGramsAction(logId: string, formData: FormData) {
  const parsed = updateFoodLogSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase
    .from("food_logs")
    .update({ consumed_grams: parsed.data.grams })
    .eq("id", logId)
    .eq("user_id", user.id);

  revalidatePath("/today");
  revalidatePath("/history");
}

export async function deleteFoodLogAction(logId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase.from("food_logs").delete().eq("id", logId).eq("user_id", user.id);

  revalidatePath("/today");
  revalidatePath("/history");
}

async function getUserTimezone(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", userId)
    .maybeSingle();

  return data?.timezone ?? "UTC";
}

function validationError(error: z.ZodError): LogFoodMutationState {
  const fieldErrors: LogFoodMutationState["fieldErrors"] = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0];
    if ((field === "foodId" || field === "grams") && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  });

  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    fieldErrors,
  };
}

function mutationError(message: string): LogFoodMutationState {
  return {
    status: "error",
    message,
    fieldErrors: {},
  };
}
