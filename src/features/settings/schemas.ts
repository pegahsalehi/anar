import { z } from "zod";
import { parseGoalNumberInput, goalRangeOrderMessage } from "@/features/settings/validation";

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

export const dailyGoalRangesSchema = z
  .object({
    caloriesMin: goalNumberSchema,
    caloriesMax: goalNumberSchema,
    proteinMin: goalNumberSchema,
    proteinMax: goalNumberSchema,
    carbohydratesMin: goalNumberSchema,
    carbohydratesMax: goalNumberSchema,
    fatMin: goalNumberSchema,
    fatMax: goalNumberSchema,
  })
  .superRefine((data, context) => {
    addRangeIssue(context, data.caloriesMin, data.caloriesMax, "caloriesMin");
    addRangeIssue(context, data.proteinMin, data.proteinMax, "proteinMin");
    addRangeIssue(
      context,
      data.carbohydratesMin,
      data.carbohydratesMax,
      "carbohydratesMin",
    );
    addRangeIssue(context, data.fatMin, data.fatMax, "fatMin");
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

function addRangeIssue(
  context: z.RefinementCtx,
  minValue: number,
  maxValue: number,
  path: string,
) {
  if (minValue <= maxValue) {
    return;
  }

  context.addIssue({
    code: z.ZodIssueCode.custom,
    message: goalRangeOrderMessage,
    path: [path],
  });
}
