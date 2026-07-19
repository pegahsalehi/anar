import { z } from "zod";
import {
  allowedFoodImageTypes,
  maxFoodImageSizeBytes,
  type FoodImageFile,
} from "@/lib/storage/food-images";
import { parseFoodNumberInput } from "@/features/foods/validation";

const finiteNonnegativeNumber = z.unknown().transform((value, context) => {
  const parsed = parseFoodNumberInput(value);

  if (!parsed.ok) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: parsed.error,
    });

    return z.NEVER;
  }

  return parsed.value;
});

export const foodFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Food name is required.")
    .max(120, "Food name must be 120 characters or fewer."),
  caloriesPer100g: finiteNonnegativeNumber,
  proteinPer100g: finiteNonnegativeNumber,
  carbohydratesPer100g: finiteNonnegativeNumber,
  fatPer100g: finiteNonnegativeNumber,
  notes: z.string().trim().max(1000, "Notes must be 1,000 characters or fewer.").optional(),
  isFavorite: z.preprocess((value) => value === "on" || value === "true", z.boolean()),
  imageAction: z.enum(["keep", "remove", "replace"]).default("keep"),
});

export function validateOptionalFoodImage(value: FormDataEntryValue | null) {
  if (!value || typeof value === "string" || !isFoodImageFile(value) || value.size === 0) {
    return { ok: true as const, file: null };
  }

  if (!allowedFoodImageTypes.includes(value.type as (typeof allowedFoodImageTypes)[number])) {
    return { ok: false as const, error: "Use a JPEG, PNG, or WebP image." };
  }

  if (value.size > maxFoodImageSizeBytes) {
    return { ok: false as const, error: "Images must be 1 MB or smaller." };
  }

  return { ok: true as const, file: value };
}

function isFoodImageFile(value: FormDataEntryValue): value is FormDataEntryValue & FoodImageFile {
  if (!value || typeof value === "string") {
    return false;
  }

  const fileLike = value as Partial<FoodImageFile>;

  return (
    typeof fileLike.size === "number" &&
    typeof fileLike.type === "string" &&
    typeof fileLike.name === "string" &&
    typeof fileLike.arrayBuffer === "function"
  );
}
