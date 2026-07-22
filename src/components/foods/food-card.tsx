import { Pencil } from "lucide-react";
import { DeleteFoodButton } from "@/features/foods/components/delete-food-button";
import { FavoriteFoodButton } from "@/features/foods/components/favorite-food-button";
import type { FoodListItem } from "@/features/foods/types";
import { FoodImage } from "@/components/foods/food-image";
import { NutrientChip } from "@/components/nutrition/nutrient-theme";
import { OnlineOnlyLink } from "@/components/pwa/online-status";
import { formatCalories, formatDecimal } from "@/lib/format";

type FoodCardProps = {
  food: FoodListItem;
};

export function FoodCard({ food }: FoodCardProps) {
  return (
    <article className="flex h-full min-w-0 flex-col rounded-md border border-border/80 bg-card p-2.5 shadow-sm transition hover:border-primary/35 sm:p-3.5">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md sm:h-16 sm:w-16">
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

      <div className="mt-2.5 flex items-end gap-2 sm:mt-3">
        <dl className="grid min-w-0 flex-1 grid-cols-4 gap-1 text-[0.62rem] sm:gap-1.5 sm:text-[0.68rem]">
          <NutrientChip
            className="px-1 py-1 [&_dd]:text-[0.66rem] [&_dt]:text-[0.58rem] sm:px-1.5 sm:[&_dd]:text-[0.72rem] sm:[&_dt]:text-[0.62rem]"
            label="Cal"
            value={formatCalories(food.calories_per_100g)}
            variant="calories"
          />
          <NutrientChip
            className="px-1 py-1 [&_dd]:text-[0.66rem] [&_dt]:text-[0.58rem] sm:px-1.5 sm:[&_dd]:text-[0.72rem] sm:[&_dt]:text-[0.62rem]"
            label="Pro"
            value={`${formatDecimal(food.protein_per_100g)} g`}
            variant="protein"
          />
          <NutrientChip
            className="px-1 py-1 [&_dd]:text-[0.66rem] [&_dt]:text-[0.58rem] sm:px-1.5 sm:[&_dd]:text-[0.72rem] sm:[&_dt]:text-[0.62rem]"
            label="Carb"
            value={`${formatDecimal(food.carbohydrates_per_100g)} g`}
            variant="carbs"
          />
          <NutrientChip
            className="px-1 py-1 [&_dd]:text-[0.66rem] [&_dt]:text-[0.58rem] sm:px-1.5 sm:[&_dd]:text-[0.72rem] sm:[&_dt]:text-[0.62rem]"
            label="Fat"
            value={`${formatDecimal(food.fat_per_100g)} g`}
            variant="fat"
          />
        </dl>
        <div className="flex shrink-0 items-center gap-1.5">
          <OnlineOnlyLink
            aria-label={`Edit ${food.name}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={`/foods/${food.id}/edit`}
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
          </OnlineOnlyLink>
          <DeleteFoodButton foodId={food.id} foodName={food.name} />
        </div>
      </div>
    </article>
  );
}
