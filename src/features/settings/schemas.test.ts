import { describe, expect, it } from "vitest";
import {
  appPreferencesSchema,
  changePasswordSchema,
  dailyNutritionTargetsSchema,
} from "@/features/settings/schemas";

describe("settings schemas", () => {
  it("accepts valid daily nutrition targets", () => {
    const result = dailyNutritionTargetsSchema.safeParse({
      caloriesTarget: "1600",
      proteinTarget: "105",
      carbohydratesTarget: "205",
      fatTarget: "60",
    });

    expect(result.success).toBe(true);
    expect(result.success ? result.data.caloriesTarget : null).toBe(1600);
  });

  it("rejects invalid and negative targets", () => {
    const result = dailyNutritionTargetsSchema.safeParse({
      caloriesTarget: "nope",
      proteinTarget: "-1",
      carbohydratesTarget: "205",
      fatTarget: "60",
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected settings targets to fail validation.");
    }

    expect(result.error.issues.map((issue) => issue.path[0])).toContain("caloriesTarget");
    expect(result.error.issues.map((issue) => issue.path[0])).toContain("proteinTarget");
  });

  it("validates password strength and confirmation", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "old-password",
        newPassword: "newpassword",
        confirmNewPassword: "newpassword",
      }).success,
    ).toBe(false);

    expect(
      changePasswordSchema.safeParse({
        currentPassword: "old-password",
        newPassword: "newpassword1",
        confirmNewPassword: "different1",
      }).success,
    ).toBe(false);

    expect(
      changePasswordSchema.safeParse({
        currentPassword: "old-password",
        newPassword: "newpassword1",
        confirmNewPassword: "newpassword1",
      }).success,
    ).toBe(true);
  });

  it("validates persisted app preferences", () => {
    expect(
      appPreferencesSchema.safeParse({
        weekStartsOn: "monday",
        timeFormat: "24h",
      }).success,
    ).toBe(true);

    expect(
      appPreferencesSchema.safeParse({
        weekStartsOn: "friday",
        timeFormat: "military",
      }).success,
    ).toBe(false);
  });
});
