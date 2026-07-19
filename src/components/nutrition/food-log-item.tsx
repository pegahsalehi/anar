import { Pencil, Save, Trash2 } from "lucide-react";
import { FoodImage } from "@/components/foods/food-image";
import {
  deleteFoodLogAction,
  updateFoodLogGramsAction,
} from "@/features/today/actions";
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
    <article className="flex flex-col gap-4 rounded-md border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md">
          <FoodImage alt={`${log.name} image`} src={log.imageUrl ?? null} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-card-foreground">{log.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatGram(log.grams)}, {log.time}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-center text-xs sm:w-96 sm:grid-cols-4">
        <div className="rounded-md bg-muted px-2 py-2">
          <dt className="text-muted-foreground">Calories</dt>
          <dd className="mt-1 font-medium">{formatCalories(log.calories)}</dd>
        </div>
        <div className="rounded-md bg-muted px-2 py-2">
          <dt className="text-muted-foreground">Protein</dt>
          <dd className="mt-1 font-medium">{formatDecimal(log.protein)} g</dd>
        </div>
        <div className="rounded-md bg-muted px-2 py-2">
          <dt className="text-muted-foreground">Carbs</dt>
          <dd className="mt-1 font-medium">{formatDecimal(log.carbohydrates)} g</dd>
        </div>
        <div className="rounded-md bg-muted px-2 py-2">
          <dt className="text-muted-foreground">Fat</dt>
          <dd className="mt-1 font-medium">{formatDecimal(log.fat)} g</dd>
        </div>
      </dl>
      {editable ? (
        <div className="flex gap-2 self-end sm:self-auto">
          <details className="group relative">
            <summary
              aria-label={`Edit ${log.name}`}
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
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
              className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-coral hover:text-coral"
              type="submit"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}
