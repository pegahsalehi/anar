import type { Database } from "@/types/database";

type FoodSnapshotSource = Pick<
  Database["public"]["Tables"]["foods"]["Row"],
  | "id"
  | "name"
  | "image_path"
  | "calories_per_100g"
  | "protein_per_100g"
  | "carbohydrates_per_100g"
  | "fat_per_100g"
>;

type FoodLogInsert = Database["public"]["Tables"]["food_logs"]["Insert"];

type BuildFoodLogInsertPayloadInput = {
  userId: string;
  food: FoodSnapshotSource;
  consumedGrams: number;
  loggedAt: string;
  localLogDate: string;
};

export function buildFoodLogInsertPayload({
  userId,
  food,
  consumedGrams,
  loggedAt,
  localLogDate,
}: BuildFoodLogInsertPayloadInput): FoodLogInsert {
  return {
    user_id: userId,
    food_id: food.id,
    consumed_grams: consumedGrams,
    logged_at: loggedAt,
    local_log_date: localLogDate,
    food_name_snapshot: food.name,
    image_path_snapshot: food.image_path,
    calories_per_100g_snapshot: food.calories_per_100g,
    protein_per_100g_snapshot: food.protein_per_100g,
    carbohydrates_per_100g_snapshot: food.carbohydrates_per_100g,
    fat_per_100g_snapshot: food.fat_per_100g,
  };
}
