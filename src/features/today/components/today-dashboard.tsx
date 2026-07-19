"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { ImagePlus, Plus, Utensils, X } from "lucide-react";
import { FoodImage } from "@/components/foods/food-image";
import { PageHeader } from "@/components/layout/page-header";
import { DailySummary } from "@/components/nutrition/daily-summary";
import { FoodLogItem } from "@/components/nutrition/food-log-item";
import { StreakCard } from "@/components/nutrition/streak-card";
import { EmptyState } from "@/components/ui/empty-state";
import { addFoodLogAction } from "@/features/today/actions";
import {
  initialLogFoodMutationState,
  type TodayDashboardData,
  type TodayFoodOption,
} from "@/features/today/types";
import { formatCalories, formatDecimal } from "@/lib/format";

type TodayDashboardProps = {
  data: TodayDashboardData;
};

export function TodayDashboard({ data }: TodayDashboardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);

  function openLogDialog(foodId?: string) {
    setSelectedFoodId(foodId ?? data.foods[0]?.id ?? null);
    setIsDialogOpen(true);
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={data.displayDate}
        title="How is today going?"
        description="Track today's intake, review macro progress, and log favorite foods quickly."
        action={
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#59CF95] active:bg-[#3FBD7E]"
            onClick={() => openLogDialog()}
            type="button"
          >
            <Plus aria-hidden="true" className="h-5 w-5" />
            Add food
          </button>
        }
      />

      {data.error ? (
        <p className="rounded-md border border-coral/25 bg-coral/10 px-4 py-3 text-sm text-coral" role="alert">
          {data.error}
        </p>
      ) : null}

      <div className="space-y-4">
        <DailySummary progress={data.progress} />
        <div className="max-w-sm">
          <StreakCard {...data.streak} />
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-bold text-foreground">Today&apos;s foods</h2>
          <span className="text-sm text-muted-foreground">
            {data.logs.length} {data.logs.length === 1 ? "entry" : "entries"}
          </span>
        </div>
        {data.logs.length > 0 ? (
          <div className="grid gap-3">
            {data.logs.map((log) => (
              <FoodLogItem key={log.id} log={log} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nothing logged yet"
            description="Add the first food for today and your totals will update here."
            action={
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#59CF95]"
                onClick={() => openLogDialog()}
                type="button"
              >
                <Plus aria-hidden="true" className="h-5 w-5" />
                Add food
              </button>
            }
          />
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-bold text-foreground">Quick access</h2>
          <Link className="text-sm font-semibold text-primary hover:underline" href="/foods">
            Manage library
          </Link>
        </div>
        {data.quickFoods.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {data.quickFoods.map((food) => (
              <button
                className="flex min-h-20 items-center gap-3 rounded-md border border-border bg-card p-3 text-left text-sm shadow-sm transition hover:border-primary hover:bg-muted"
                key={food.id}
                onClick={() => openLogDialog(food.id)}
                type="button"
              >
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-md">
                  <FoodImage alt={`${food.name} image`} src={food.imageUrl} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-bold text-card-foreground">
                    {food.name}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {formatCalories(food.calories_per_100g)} per 100 g
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your library is empty"
            description="Create reusable foods first, then log them here by grams."
            action={
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#59CF95]"
                href="/foods/new"
              >
                <ImagePlus aria-hidden="true" className="h-5 w-5" />
                Create food
              </Link>
            }
          />
        )}
      </section>

      <LogFoodDialog
        foods={data.foods}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedFoodId={selectedFoodId}
      />
    </div>
  );
}

type LogFoodDialogProps = {
  foods: TodayFoodOption[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFoodId: string | null;
};

function LogFoodDialog({
  foods,
  isOpen,
  onOpenChange,
  selectedFoodId,
}: LogFoodDialogProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(addFoodLogAction, initialLogFoodMutationState);
  const [foodId, setFoodId] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFoodId(selectedFoodId ?? foods[0]?.id ?? "");
    }
  }, [foods, isOpen, selectedFoodId]);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
      onOpenChange(false);
    }
  }, [onOpenChange, router, state.status]);

  const selectedFood = useMemo(
    () => foods.find((food) => food.id === foodId) ?? null,
    [foodId, foods],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 backdrop-blur-sm"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onOpenChange(false);
        }
      }}
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-md border border-border bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-card-foreground">Log food</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Select a saved food and enter how many grams you consumed.
            </p>
          </div>
          <button
            aria-label="Close dialog"
            className="flex h-9 w-9 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        {foods.length === 0 ? (
          <div className="mt-5 rounded-md border border-dashed border-border bg-muted p-4 text-sm text-muted-foreground">
            No foods are available yet. Create a food before logging today&apos;s intake.
          </div>
        ) : (
          <form action={formAction} className="mt-5 grid gap-4">
            {state.message && state.status === "error" ? (
              <p className="rounded-md bg-coral/10 px-3 py-2 text-sm text-coral" role="alert">
                {state.message}
              </p>
            ) : null}
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">Food</span>
              <select
                aria-invalid={Boolean(state.fieldErrors.foodId)}
                className="min-h-12 rounded-md border border-border bg-background px-3 outline-none transition focus:border-primary"
                name="foodId"
                onChange={(event) => setFoodId(event.target.value)}
                value={foodId}
              >
                {foods.map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name}
                  </option>
                ))}
              </select>
              {state.fieldErrors.foodId ? (
                <span className="text-sm text-coral" role="alert">
                  {state.fieldErrors.foodId}
                </span>
              ) : null}
            </label>

            {selectedFood ? (
              <div className="flex items-center gap-3 rounded-md bg-muted p-3">
                <span className="h-14 w-14 shrink-0 overflow-hidden rounded-md">
                  <FoodImage alt={`${selectedFood.name} image`} src={selectedFood.imageUrl} />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="truncate font-bold text-card-foreground">{selectedFood.name}</p>
                  <p className="mt-1 text-muted-foreground">
                    {formatCalories(selectedFood.calories_per_100g)} cal,{" "}
                    {formatDecimal(selectedFood.protein_per_100g)} g protein,{" "}
                    {formatDecimal(selectedFood.carbohydrates_per_100g)} g carbs,{" "}
                    {formatDecimal(selectedFood.fat_per_100g)} g fat per 100 g
                  </p>
                </div>
              </div>
            ) : null}

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-foreground">Consumed grams</span>
              <input
                aria-invalid={Boolean(state.fieldErrors.grams)}
                className="min-h-12 rounded-md border border-border bg-background px-3 outline-none transition focus:border-primary"
                defaultValue="100"
                inputMode="decimal"
                name="grams"
                placeholder="100"
                type="text"
              />
              {state.fieldErrors.grams ? (
                <span className="text-sm text-coral" role="alert">
                  {state.fieldErrors.grams}
                </span>
              ) : null}
            </label>

            <LogFoodSubmitButton />
          </form>
        )}

        {foods.length === 0 ? (
          <Link
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[#59CF95]"
            href="/foods/new"
          >
            <Utensils aria-hidden="true" className="h-5 w-5" />
            Create food
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function LogFoodSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft transition hover:bg-[#59CF95] active:bg-[#3FBD7E] disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      <Plus aria-hidden="true" className="h-5 w-5" />
      {pending ? "Logging..." : "Log food"}
    </button>
  );
}
