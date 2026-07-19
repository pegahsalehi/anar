import { describe, expect, it } from "vitest";
import {
  getFoodNumberValidationError,
  normalizeFoodNameForDuplicate,
  parseFoodNumberInput,
  validFoodNumberMessage,
} from "@/features/foods/validation";

describe("food validation helpers", () => {
  it("accepts plain non-negative numbers", () => {
    expect(parseFoodNumberInput("0")).toEqual({ ok: true, value: 0 });
    expect(parseFoodNumberInput("15.2")).toEqual({ ok: true, value: 15.2 });
    expect(parseFoodNumberInput(".5")).toEqual({ ok: true, value: 0.5 });
  });

  it("rejects letters, invalid symbols, NaN, and infinite values", () => {
    expect(getFoodNumberValidationError("abc")).toBe(validFoodNumberMessage);
    expect(getFoodNumberValidationError("$10")).toBe(validFoodNumberMessage);
    expect(getFoodNumberValidationError("NaN")).toBe(validFoodNumberMessage);
    expect(getFoodNumberValidationError("Infinity")).toBe(validFoodNumberMessage);
    expect(getFoodNumberValidationError(Number.NaN)).toBe(validFoodNumberMessage);
    expect(getFoodNumberValidationError(Number.POSITIVE_INFINITY)).toBe(
      validFoodNumberMessage,
    );
  });

  it("normalizes duplicate food names by trimming and lowercasing", () => {
    expect(normalizeFoodNameForDuplicate(" Rice ")).toBe("rice");
    expect(normalizeFoodNameForDuplicate("Rice")).toBe(
      normalizeFoodNameForDuplicate("rice"),
    );
  });
});
