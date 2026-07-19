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

export type WeekStartsOnPreference = "sunday" | "monday";
export type TimeFormatPreference = "12h" | "24h";

export type AppPreferenceValues = {
  weekStartsOn: WeekStartsOnPreference;
  timeFormat: TimeFormatPreference;
};

export type AppPreferenceField = keyof AppPreferenceValues;

export type AppPreferenceActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: Partial<Record<AppPreferenceField, string>>;
};

export type SettingsPageData = {
  dailyGoals: DailyNutritionTargetValues;
  effectiveDate: string;
  preferences: AppPreferenceValues;
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

export const initialAppPreferenceActionState: AppPreferenceActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};
