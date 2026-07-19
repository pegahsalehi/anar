import { z } from "zod";
import { parseGoalNumberInput } from "@/features/settings/validation";

const goalNumberSchema = z.unknown().transform((value, context) => {
  const parsed = parseGoalNumberInput(value);

  if (!parsed.ok) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: parsed.error,
    });

    return z.NEVER;
  }

  return parsed.value;
});

export const dailyNutritionTargetsSchema = z.object({
  caloriesTarget: goalNumberSchema,
  proteinTarget: goalNumberSchema,
  carbohydratesTarget: goalNumberSchema,
  fatTarget: goalNumberSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Za-z]/, "Password must include at least one letter.")
      .regex(/[0-9]/, "Password must include at least one number."),
    confirmNewPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  });

export const appPreferencesSchema = z.object({
  weekStartsOn: z.enum(["sunday", "monday"], {
    error: "Choose whether weeks start on Sunday or Monday.",
  }),
  timeFormat: z.enum(["12h", "24h"], {
    error: "Choose a time format.",
  }),
});
