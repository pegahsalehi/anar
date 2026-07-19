import Link from "next/link";
import { Pencil } from "lucide-react";
import { DeleteFoodButton } from "@/features/foods/components/delete-food-button";
import { FavoriteFoodButton } from "@/features/foods/components/favorite-food-button";
import type { FoodListItem } from "@/features/foods/types";
import { FoodImage } from "@/components/foods/food-image";
import { formatCalories, formatDecimal } from "@/lib/format";

type FoodCardProps = {
  food: FoodListItem;
};

export function FoodCard({ food }: FoodCardProps) {
  return (
    <article className="flex h-full flex-col rounded-md border border-border bg-card p-3 shadow-sm transition hover:border-primary">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md">
            <FoodImage alt={`${food.name} image`} src={food.imageUrl} />
          </div>
          <div>
            <h2 className="font-semibold text-card-foreground">{food.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatCalories(food.calories_per_100g)} per 100 g
            </p>
          </div>
        </div>
        <FavoriteFoodButton foodId={food.id} isFavorite={food.is_favorite} />
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-1.5 text-xs">
        <div className="min-w-0 rounded-sm bg-muted px-2 py-1.5">
          <dt className="truncate text-[0.7rem] leading-4 text-muted-foreground">Protein</dt>
          <dd className="mt-0.5 truncate whitespace-nowrap font-medium leading-4">
            {formatDecimal(food.protein_per_100g)} g
          </dd>
        </div>
        <div className="min-w-0 rounded-sm bg-muted px-2 py-1.5">
          <dt className="truncate text-[0.7rem] leading-4 text-muted-foreground">Carbs</dt>
          <dd className="mt-0.5 truncate whitespace-nowrap font-medium leading-4">
            {formatDecimal(food.carbohydrates_per_100g)} g
          </dd>
        </div>
        <div className="min-w-0 rounded-sm bg-muted px-2 py-1.5">
          <dt className="truncate text-[0.7rem] leading-4 text-muted-foreground">Fat</dt>
          <dd className="mt-0.5 truncate whitespace-nowrap font-medium leading-4">
            {formatDecimal(food.fat_per_100g)} g
          </dd>
        </div>
      </dl>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <Link
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground"
          href={`/foods/${food.id}/edit`}
        >
          <Pencil aria-hidden="true" className="h-4 w-4" />
          Edit
        </Link>
        <DeleteFoodButton foodId={food.id} foodName={food.name} />
      </div>
    </article>
  );
}
