import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSignedImageUrlMap } from "@/lib/storage/food-images";
import type { FoodListItem, FoodRow } from "@/features/foods/types";

export async function getAuthenticatedFoods(searchTerm?: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { foods: [] as FoodListItem[], error: "You must be signed in." };
  }

  const trimmedSearch = searchTerm?.trim();
  let query = supabase
    .from("foods")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("is_favorite", { ascending: false })
    .order("created_at", { ascending: false });

  if (trimmedSearch) {
    query = query.ilike("name", `%${trimmedSearch}%`);
  }

  const { data, error } = await query;

  if (error) {
    return { foods: [] as FoodListItem[], error: "Food Library could not be loaded." };
  }

  const rows = (data ?? []) as FoodRow[];
  const imageUrls = await createSignedImageUrlMap(
    supabase,
    rows.map((food) => food.image_path),
  );

  return {
    foods: rows.map((food) => ({
      ...food,
      imageUrl: food.image_path ? imageUrls.get(food.image_path) ?? null : null,
    })),
    error: null,
  };
}

export async function getAuthenticatedFoodForEdit(id: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const food = data as FoodRow;
  const imageUrls = await createSignedImageUrlMap(supabase, [food.image_path]);

  return {
    food,
    imageUrl: food.image_path ? imageUrls.get(food.image_path) ?? null : null,
  };
}
