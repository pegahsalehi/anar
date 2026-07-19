export type DailyGoalRangeField =
  | "caloriesMin"
  | "caloriesMax"
  | "proteinMin"
  | "proteinMax"
  | "carbohydratesMin"
  | "carbohydratesMax"
  | "fatMin"
  | "fatMax";

export type DailyGoalRangeValues = Record<DailyGoalRangeField, number>;

export type DailyGoalRangeActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: Partial<Record<DailyGoalRangeField, string>>;
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
  dailyGoals: DailyGoalRangeValues;
  effectiveDate: string;
  error: string | null;
};

export const initialDailyGoalRangeActionState: DailyGoalRangeActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

export const initialChangePasswordActionState: ChangePasswordActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};
