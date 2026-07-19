import { parseFoodNumberInput, validFoodNumberMessage } from "@/features/foods/validation";
import type {
  DailyGoalRangeField,
  DailyGoalRangeValues,
} from "@/features/settings/types";

export const goalRangeOrderMessage = "Minimum cannot be greater than maximum.";

const rangePairs: Array<{
  min: DailyGoalRangeField;
  max: DailyGoalRangeField;
}> = [
  { min: "caloriesMin", max: "caloriesMax" },
  { min: "proteinMin", max: "proteinMax" },
  { min: "carbohydratesMin", max: "carbohydratesMax" },
  { min: "fatMin", max: "fatMax" },
];

export function parseGoalNumberInput(value: unknown) {
  return parseFoodNumberInput(value);
}

export function getGoalNumberValidationError(value: unknown) {
  const parsed = parseGoalNumberInput(value);
  return parsed.ok ? null : parsed.error || validFoodNumberMessage;
}

export function validateDailyGoalRangeFormData(formData: FormData) {
  const fieldErrors: Partial<Record<DailyGoalRangeField, string>> = {};
  const values = {} as DailyGoalRangeValues;

  dailyGoalRangeFields.forEach((field) => {
    const parsed = parseGoalNumberInput(formData.get(field));

    if (!parsed.ok) {
      fieldErrors[field] = parsed.error;
      return;
    }

    values[field] = parsed.value;
  });

  rangePairs.forEach(({ min, max }) => {
    if (fieldErrors[min] || fieldErrors[max]) {
      return;
    }

    if (values[min] > values[max]) {
      fieldErrors[min] = goalRangeOrderMessage;
    }
  });

  return Object.keys(fieldErrors).length > 0
    ? { ok: false as const, fieldErrors }
    : { ok: true as const, values };
}

export const dailyGoalRangeFields: DailyGoalRangeField[] = [
  "caloriesMin",
  "caloriesMax",
  "proteinMin",
  "proteinMax",
  "carbohydratesMin",
  "carbohydratesMax",
  "fatMin",
  "fatMax",
];
