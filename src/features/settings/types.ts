export type DailyNutritionTargetField =
  | "caloriesTarget"
  | "proteinTarget"
  | "carbohydratesTarget"
  | "fatTarget";

export type DailyNutritionTargetValues = Record<DailyNutritionTargetField, number>;

export type DailyNutritionTargetActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: Partial<Record<DailyNutritionTargetField, string>>;
};

export type ChangePasswordField =
  | "currentPassword"
  | "newPassword"
  | "confirmNewPassword";

export type ChangePasswordActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: Partial<Record<ChangePasswordField, string>>;
};

export type SettingsPageData = {
  dailyGoals: DailyNutritionTargetValues;
  effectiveDate: string;
  error: string | null;
};

export const initialDailyNutritionTargetActionState: DailyNutritionTargetActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

export const initialChangePasswordActionState: ChangePasswordActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};
