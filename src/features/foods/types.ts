import type { Database } from "@/types/database";

export type FoodRow = Database["public"]["Tables"]["foods"]["Row"];

export type FoodListItem = FoodRow & {
  imageUrl: string | null;
};

export type FoodFormValues = {
  name: string;
  caloriesPer100g: string;
  proteinPer100g: string;
  carbohydratesPer100g: string;
  fatPer100g: string;
  notes: string;
  isFavorite: boolean;
};

export type FoodMutationState = {
  status: "idle" | "error";
  message: string | null;
  fieldErrors: Partial<Record<keyof FoodFormValues | "image", string>>;
};

export const initialFoodMutationState: FoodMutationState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};
