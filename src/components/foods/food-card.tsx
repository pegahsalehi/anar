import Link from "next/link";
import { Pencil } from "lucide-react";
import { DeleteFoodButton } from "@/features/foods/components/delete-food-button";
import { FavoriteFoodButton } from "@/features/foods/components/favorite-food-button";
import type { FoodListItem } from "@/features/foods/types";
import { FoodImage } from "@/components/foods/food-image";
import { NutrientChip } from "@/components/nutrition/nutrient-theme";
import { formatCalories, formatDecimal } from "@/lib/format";

type FoodCardProps = {
  food: FoodListItem;
};

export function FoodCard({ food }: FoodCardProps) {
  return (
    <article className="flex h-full min-w-0 flex-col rounded-md border border-border bg-card p-2.5 shadow-sm transition hover:border-primary sm:p-3">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 gap-2.5 sm:gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md sm:h-14 sm:w-14">
            <FoodImage alt={`${food.name} image`} src={food.imageUrl} />
          </div>
          <div className="min-w-0 pt-0.5">
            <h2 className="truncate text-sm font-semibold leading-5 text-card-foreground sm:text-base">
              {food.name}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">Per 100 g</p>
          </div>
        </div>
        <FavoriteFoodButton foodId={food.id} isFavorite={food.is_favorite} />
      </div>

      <div className="mt-2.5 flex items-end gap-2">
        <dl className="grid min-w-0 flex-1 grid-cols-2 gap-1 text-[0.68rem] min-[390px]:grid-cols-4">
          <NutrientChip
            className="px-1.5 py-1 [&_dd]:text-[0.72rem] [&_dt]:text-[0.62rem]"
            label="Cal"
            value={formatCalories(food.calories_per_100g)}
            variant="calories"
          />
          <NutrientChip
            className="px-1.5 py-1 [&_dd]:text-[0.72rem] [&_dt]:text-[0.62rem]"
            label="Pro"
            value={`${formatDecimal(food.protein_per_100g)} g`}
            variant="protein"
          />
          <NutrientChip
            className="px-1.5 py-1 [&_dd]:text-[0.72rem] [&_dt]:text-[0.62rem]"
            label="Carb"
            value={`${formatDecimal(food.carbohydrates_per_100g)} g`}
            variant="carbs"
          />
          <NutrientChip
            className="px-1.5 py-1 [&_dd]:text-[0.72rem] [&_dt]:text-[0.62rem]"
            label="Fat"
            value={`${formatDecimal(food.fat_per_100g)} g`}
            variant="fat"
          />
        </dl>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            aria-label={`Edit ${food.name}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-primary hover:text-foreground"
            href={`/foods/${food.id}/edit`}
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
          </Link>
          <DeleteFoodButton foodId={food.id} foodName={food.name} />
        </div>
      </div>
    </article>
  );
}
