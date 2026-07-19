import type { FoodListItem } from "@/features/foods/types";
import type {
  DailyNutritionProgress,
  NutritionTargets,
  NutritionValues,
} from "@/lib/nutrition";
import type { Database } from "@/types/database";

export type FoodLogRow = Database["public"]["Tables"]["food_logs"]["Row"];

export type TodayFoodOption = Pick<
  FoodListItem,
  | "id"
  | "name"
  | "imageUrl"
  | "is_favorite"
  | "calories_per_100g"
  | "protein_per_100g"
  | "carbohydrates_per_100g"
>;

export type TodayFoodLogItem = {
  id: string;
  foodId: string | null;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  loggedAt: string;
  time: string;
  imageUrl: string | null;
};

export type TodayDashboardData = {
  localDate: string;
  displayDate: string;
  timezone: string;
  goals: NutritionTargets;
  totals: NutritionValues;
  progress: DailyNutritionProgress;
  foods: TodayFoodOption[];
  quickFoods: TodayFoodOption[];
  logs: TodayFoodLogItem[];
  streak: {
    currentStreak: number;
    longestStreak: number;
    activeDays: number;
  };
  error: string | null;
};

export type LogFoodMutationState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: Partial<Record<"foodId" | "grams", string>>;
};

export const initialLogFoodMutationState: LogFoodMutationState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};
