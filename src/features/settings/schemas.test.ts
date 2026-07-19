import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  dailyGoalRangesSchema,
} from "@/features/settings/schemas";

describe("settings schemas", () => {
  it("accepts valid daily nutrition ranges", () => {
    const result = dailyGoalRangesSchema.safeParse({
      caloriesMin: "1500",
      caloriesMax: "1700",
      proteinMin: "90",
      proteinMax: "120",
      carbohydratesMin: "180",
      carbohydratesMax: "230",
      fatMin: "50",
      fatMax: "70",
    });

    expect(result.success).toBe(true);
    expect(result.success ? result.data.caloriesMin : null).toBe(1500);
  });

  it("rejects invalid and negative ranges", () => {
    const result = dailyGoalRangesSchema.safeParse({
      caloriesMin: "nope",
      caloriesMax: "1700",
      proteinMin: "-1",
      proteinMax: "120",
      carbohydratesMin: "180",
      carbohydratesMax: "230",
      fatMin: "50",
      fatMax: "70",
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected settings ranges to fail validation.");
    }

    expect(result.error.issues.map((issue) => issue.path[0])).toContain("caloriesMin");
    expect(result.error.issues.map((issue) => issue.path[0])).toContain("proteinMin");
  });

  it("rejects unordered ranges", () => {
    const result = dailyGoalRangesSchema.safeParse({
      caloriesMin: "1500",
      caloriesMax: "1700",
      proteinMin: "90",
      proteinMax: "120",
      carbohydratesMin: "240",
      carbohydratesMax: "230",
      fatMin: "50",
      fatMax: "70",
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected settings ranges to fail validation.");
    }

    expect(result.error.issues.map((issue) => issue.path[0])).toContain("carbohydratesMin");
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
});
