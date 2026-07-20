import { Pencil, Save, Trash2 } from "lucide-react";
import { FoodImage } from "@/components/foods/food-image";
import {
  deleteFoodLogAction,
  updateFoodLogGramsAction,
} from "@/features/today/actions";
import { NutrientChip } from "@/components/nutrition/nutrient-theme";
import { formatCalories, formatDecimal, formatGram } from "@/lib/format";

export type FoodLogListItem = {
  id: string;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  time: string;
  imageUrl?: string | null;
};

type FoodLogItemProps = {
  log: FoodLogListItem;
  editable?: boolean;
};

export function FoodLogItem({ log, editable = true }: FoodLogItemProps) {
  const updateAction = updateFoodLogGramsAction.bind(null, log.id);
  const deleteAction = deleteFoodLogAction.bind(null, log.id);

  return (
    <article className="rounded-md border border-border bg-card p-3 shadow-sm sm:flex sm:items-center sm:gap-4 sm:p-4">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md sm:h-14 sm:w-14">
          <FoodImage alt={`${log.name} image`} src={log.imageUrl ?? null} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-card-foreground sm:text-base">
            {log.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground sm:mt-1 sm:text-sm">
            {formatGram(log.grams)}
            {" \u00b7 "}
            {log.time}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-end gap-2 sm:mt-0 sm:items-center">
        <dl className="grid min-w-0 flex-1 grid-cols-2 gap-1.5 text-center text-[0.68rem] min-[390px]:grid-cols-4 sm:w-96 sm:flex-none sm:grid-cols-4 sm:gap-2 sm:text-xs">
          <NutrientChip
            className="px-1 py-1.5 text-center [&_dd]:text-[0.64rem] [&_dt]:text-[0.58rem] sm:px-2 sm:py-2 sm:[&_dd]:text-xs sm:[&_dt]:text-[0.7rem]"
            value={formatCalories(log.calories)}
            variant="calories"
          />
          <NutrientChip
            className="px-1 py-1.5 text-center [&_dd]:text-[0.64rem] [&_dt]:text-[0.58rem] sm:px-2 sm:py-2 sm:[&_dd]:text-xs sm:[&_dt]:text-[0.7rem]"
            value={`${formatDecimal(log.protein)} g`}
            variant="protein"
          />
          <NutrientChip
            className="px-1 py-1.5 text-center [&_dd]:text-[0.64rem] [&_dt]:text-[0.58rem] sm:px-2 sm:py-2 sm:[&_dd]:text-xs sm:[&_dt]:text-[0.7rem]"
            value={`${formatDecimal(log.carbohydrates)} g`}
            variant="carbs"
          />
          <NutrientChip
            className="px-1 py-1.5 text-center [&_dd]:text-[0.64rem] [&_dt]:text-[0.58rem] sm:px-2 sm:py-2 sm:[&_dd]:text-xs sm:[&_dt]:text-[0.7rem]"
            value={`${formatDecimal(log.fat)} g`}
            variant="fat"
          />
        </dl>
        {editable ? (
          <div className="flex shrink-0 gap-1.5 sm:gap-2">
            <details className="group relative">
              <summary
                aria-label={`Edit ${log.name}`}
                className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                <Pencil aria-hidden="true" className="h-4 w-4" />
              </summary>
              <form
                action={updateAction}
                className="absolute right-0 top-12 z-10 grid w-56 gap-3 rounded-md border border-border bg-card p-3 text-sm shadow-soft"
              >
                <label className="grid gap-1 font-semibold">
                  Grams
                  <input
                    className="min-h-10 rounded-md border border-border bg-background px-3 outline-none transition focus:border-primary"
                    defaultValue={String(log.grams)}
                    inputMode="decimal"
                    name="grams"
                    type="text"
                  />
                </label>
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 font-semibold text-primary-foreground transition hover:bg-[#49C995]"
                  type="submit"
                >
                  <Save aria-hidden="true" className="h-4 w-4" />
                  Save
                </button>
              </form>
            </details>
            <form action={deleteAction}>
              <button
                aria-label={`Delete ${log.name}`}
                className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-coral hover:text-coral"
                type="submit"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </article>
  );
}
