import { parseFoodNumberInput, validFoodNumberMessage } from "@/features/foods/validation";
import type {
  DailyNutritionTargetField,
  DailyNutritionTargetValues,
} from "@/features/settings/types";

export function parseGoalNumberInput(value: unknown) {
  return parseFoodNumberInput(value);
}

export function getGoalNumberValidationError(value: unknown) {
  const parsed = parseGoalNumberInput(value);
  return parsed.ok ? null : parsed.error || validFoodNumberMessage;
}

export function validateDailyNutritionTargetFormData(formData: FormData) {
  const fieldErrors: Partial<Record<DailyNutritionTargetField, string>> = {};
  const values = {} as DailyNutritionTargetValues;

  dailyNutritionTargetFields.forEach((field) => {
    const parsed = parseGoalNumberInput(formData.get(field));

    if (!parsed.ok) {
      fieldErrors[field] = parsed.error;
      return;
    }

    values[field] = parsed.value;
  });

  return Object.keys(fieldErrors).length > 0
    ? { ok: false as const, fieldErrors }
    : { ok: true as const, values };
}

export const dailyNutritionTargetFields: DailyNutritionTargetField[] = [
  "caloriesTarget",
  "proteinTarget",
  "carbohydratesTarget",
  "fatTarget",
];
