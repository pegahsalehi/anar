export const validFoodNumberMessage = "Please enter a valid number.";
export const duplicateFoodNameMessage = "A food with this name already exists.";

const plainNonNegativeNumberPattern = /^(?:\d+\.?\d*|\.\d+)$/;

export type FoodNumberParseResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

export function parseFoodNumberInput(value: unknown): FoodNumberParseResult {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return { ok: false, error: validFoodNumberMessage };
    }

    if (value < 0) {
      return { ok: false, error: "Value cannot be negative." };
    }

    return { ok: true, value };
  }

  if (typeof value !== "string") {
    return { ok: false, error: validFoodNumberMessage };
  }

  const normalized = value.trim();

  if (normalized.startsWith("-")) {
    return { ok: false, error: "Value cannot be negative." };
  }

  if (!plainNonNegativeNumberPattern.test(normalized)) {
    return { ok: false, error: validFoodNumberMessage };
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return { ok: false, error: validFoodNumberMessage };
  }

  return { ok: true, value: parsed };
}

export function getFoodNumberValidationError(value: unknown) {
  const parsed = parseFoodNumberInput(value);
  return parsed.ok ? null : parsed.error;
}

export function normalizeFoodNameForDuplicate(value: string) {
  return value.trim().toLowerCase();
}
