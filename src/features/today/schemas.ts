import { z } from "zod";

const positiveNumber = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    return Number.NaN;
  }

  return Number(normalized);
}, z.number().finite("Enter a valid number.").positive("Amount must be greater than 0.").max(10000, "Amount must be 10,000 g or less."));

export const logFoodSchema = z.object({
  foodId: z.string().uuid("Choose a food from your library."),
  grams: positiveNumber,
});

export const updateFoodLogSchema = z.object({
  grams: positiveNumber,
});
