"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  buildFoodImagePath,
  foodImagesBucket,
  removeFoodImage,
} from "@/lib/storage/food-images";
import { foodFormSchema, validateOptionalFoodImage } from "@/features/foods/schemas";
import type { FoodMutationState } from "@/features/foods/types";

export async function createFoodAction(
  _previousState: FoodMutationState,
  formData: FormData,
): Promise<FoodMutationState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return mutationError("You must be signed in to create foods.");
  }

  const parsed = foodFormSchema.safeParse(Object.fromEntries(formData.entries()));
  const imageValidation = validateOptionalFoodImage(formData.get("image"));

  if (!parsed.success || !imageValidation.ok) {
    return validationError(parsed.error, imageValidation.ok ? undefined : imageValidation.error);
  }

  let imagePath: string | null = null;

  if (imageValidation.file) {
    imagePath = buildFoodImagePath(user.id, imageValidation.file.type);
    const { error: uploadError } = await supabase.storage
      .from(foodImagesBucket)
      .upload(imagePath, imageValidation.file, {
        cacheControl: "3600",
        contentType: imageValidation.file.type,
        upsert: false,
      });

    if (uploadError) {
      return mutationError("Image upload failed. Please try again.");
    }
  }

  const { error } = await supabase.from("foods").insert({
    user_id: user.id,
    name: parsed.data.name,
    image_path: imagePath,
    calories_per_100g: parsed.data.caloriesPer100g,
    protein_per_100g: parsed.data.proteinPer100g,
    carbohydrates_per_100g: parsed.data.carbohydratesPer100g,
    notes: parsed.data.notes || null,
    is_favorite: parsed.data.isFavorite,
  });

  if (error) {
    await removeFoodImage(supabase, imagePath);
    return mutationError("Food could not be saved. Please try again.");
  }

  revalidatePath("/foods");
  revalidatePath("/today");
  redirect("/foods?created=1");
}

export async function updateFoodAction(
  foodId: string,
  _previousState: FoodMutationState,
  formData: FormData,
): Promise<FoodMutationState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return mutationError("You must be signed in to update foods.");
  }

  const parsed = foodFormSchema.safeParse(Object.fromEntries(formData.entries()));
  const imageValidation = validateOptionalFoodImage(formData.get("image"));

  if (!parsed.success || !imageValidation.ok) {
    return validationError(parsed.error, imageValidation.ok ? undefined : imageValidation.error);
  }

  const { data: existingFood, error: loadError } = await supabase
    .from("foods")
    .select("id, image_path")
    .eq("id", foodId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (loadError || !existingFood) {
    return mutationError("Food was not found.");
  }

  let nextImagePath = existingFood.image_path;
  let uploadedImagePath: string | null = null;

  if (parsed.data.imageAction === "remove") {
    nextImagePath = null;
  }

  if (parsed.data.imageAction === "replace" && imageValidation.file) {
    uploadedImagePath = buildFoodImagePath(user.id, imageValidation.file.type);
    const { error: uploadError } = await supabase.storage
      .from(foodImagesBucket)
      .upload(uploadedImagePath, imageValidation.file, {
        cacheControl: "3600",
        contentType: imageValidation.file.type,
        upsert: false,
      });

    if (uploadError) {
      return mutationError("Image upload failed. Please try again.");
    }

    nextImagePath = uploadedImagePath;
  }

  const { error } = await supabase
    .from("foods")
    .update({
      name: parsed.data.name,
      image_path: nextImagePath,
      calories_per_100g: parsed.data.caloriesPer100g,
      protein_per_100g: parsed.data.proteinPer100g,
      carbohydrates_per_100g: parsed.data.carbohydratesPer100g,
      notes: parsed.data.notes || null,
      is_favorite: parsed.data.isFavorite,
    })
    .eq("id", foodId)
    .eq("user_id", user.id);

  if (error) {
    await removeFoodImage(supabase, uploadedImagePath);
    return mutationError("Food could not be updated. Please try again.");
  }

  if (existingFood.image_path && existingFood.image_path !== nextImagePath) {
    await removeFoodImage(supabase, existingFood.image_path);
  }

  revalidatePath("/foods");
  revalidatePath("/today");
  redirect("/foods?updated=1");
}

export async function toggleFavoriteFoodAction(foodId: string, nextFavorite: boolean) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase
    .from("foods")
    .update({ is_favorite: nextFavorite })
    .eq("id", foodId)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  revalidatePath("/foods");
  revalidatePath("/today");
}

export async function softDeleteFoodAction(foodId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase
    .from("foods")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", foodId)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  revalidatePath("/foods");
  revalidatePath("/today");
}

function validationError(
  error: z.ZodError | undefined,
  imageError?: string,
): FoodMutationState {
  const fieldErrors: FoodMutationState["fieldErrors"] = {};

  error?.issues.forEach((issue) => {
    const field = issue.path[0];

    if (
      typeof field === "string" &&
      (field === "name" ||
        field === "caloriesPer100g" ||
        field === "proteinPer100g" ||
        field === "carbohydratesPer100g" ||
        field === "notes" ||
        field === "isFavorite") &&
      !fieldErrors[field]
    ) {
      fieldErrors[field] = issue.message;
    }
  });

  if (imageError) {
    fieldErrors.image = imageError;
  }

  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    fieldErrors,
  };
}

function mutationError(message: string): FoodMutationState {
  return {
    status: "error",
    message,
    fieldErrors: {},
  };
}
